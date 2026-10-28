import React, { useState, useEffect, useRef } from 'react';
import { 
  getScenarios, 
  selectScenario, 
  getCurrentEnvironment, 
  triggerTick, 
  getBenchmarks, 
  getBenchmarksSummary, 
  generateTasks, 
  runOffloadDecision, 
  getOffloadHistory, 
  getOffloadStats, 
  SimulationWebSocket 
} from './api';

import Header from './components/Header';
import TopologyOverview from './components/TopologyOverview';
import WorkflowPipeline from './components/WorkflowPipeline';
import TaskRunner from './components/TaskRunner';
import CostComparisonMatrix from './components/CostComparisonMatrix';
import DecisionHistory from './components/DecisionHistory';
import BenchmarkCatalog from './components/BenchmarkCatalog';
import DecisionDetailModal from './components/DecisionDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('topology');
  const [environment, setEnvironment] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('NOMINAL_5G');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simInterval, setSimInterval] = useState(2.5);
  const [tick, setTick] = useState(0);
  const [wsStatus, setWsStatus] = useState('CONNECTING');

  const [benchmarks, setBenchmarks] = useState([]);
  const [benchmarksSummary, setBenchmarksSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [workflowState, setWorkflowState] = useState(null);
  const [selectedDecisionModal, setSelectedDecisionModal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [decisionNotification, setDecisionNotification] = useState(null);

  const wsRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const decisionNotificationTimeoutRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Initial REST API Data Load
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [scList, currentEnv, benchList, benchSummary, hist, st] = await Promise.all([
          getScenarios().catch(() => []),
          getCurrentEnvironment().catch(() => null),
          getBenchmarks(50).catch(() => []),
          getBenchmarksSummary().catch(() => null),
          getOffloadHistory(25).catch(() => []),
          getOffloadStats().catch(() => null),
        ]);

        if (scList?.length) setScenarios(scList);
        if (currentEnv) {
          setEnvironment(currentEnv);
          setSelectedScenario(currentEnv.scenario_name);
          setTick(currentEnv.tick);
        }
        if (benchList?.length) setBenchmarks(benchList);
        if (benchSummary) setBenchmarksSummary(benchSummary);
        if (hist?.length) setHistory(hist);
        if (st) setStats(st);
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    }
    loadInitialData();
  }, []);

  // 2. Initialize WebSocket Streaming Telemetry
  useEffect(() => {
    const ws = new SimulationWebSocket(
      (data) => {
        // Handle incoming WebSocket messages
        if (data.type === 'INITIAL_STATE') {
          if (data.environment) {
            setEnvironment(data.environment);
            setSelectedScenario(data.environment.scenario_name);
            setTick(data.environment.tick);
          }
          if (data.history) setHistory(data.history);
          if (data.stats) setStats(data.stats);
          if (data.is_simulating !== undefined) setIsSimulating(data.is_simulating);
        } else if (data.type === 'SIMULATION_STEP') {
          if (data.environment) {
            setEnvironment(data.environment);
            setSelectedScenario(data.environment.scenario_name);
            setTick(data.tick || data.environment.tick);
          }
          if (data.task && data.decision) {
            setWorkflowState({
              status: 'COMPLETED',
              task: data.task,
              classification: data.classification,
              decision: data.decision,
              explanation: data.explanation,
              cost_evaluation: {
                task_id: data.task.task_id,
                task_type: data.task.task_type,
                alpha_latency_weight: data.decision.alpha_latency_weight,
                beta_energy_weight: data.decision.beta_energy_weight,
                deadline_ms: data.task.deadline_ms,
                battery_remaining_pct: data.environment?.device?.battery_remaining_pct || 80,
                tier_evaluations: data.decision.candidate_evaluations,
                cheapest_tier: data.decision.selected_tier,
                fastest_tier: data.decision.selected_tier,
                most_energy_efficient_tier: data.decision.selected_tier,
              },
            });
            setHistory((prev) => [data.decision, ...prev.slice(0, 49)]);
          }
          if (data.stats) setStats(data.stats);
        } else if (data.type === 'STATUS_UPDATE') {
          setIsSimulating(data.is_simulating);
        } else if (data.type === 'SCENARIO_CHANGED') {
          if (data.environment) {
            setEnvironment(data.environment);
            setSelectedScenario(data.environment.scenario_name);
            setTick(data.environment.tick);
          }
        }
      },
      (status) => {
        setWsStatus(status);
      }
    );

    ws.connect();
    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Scenario Switch
  const handleSelectScenario = async (scenarioName) => {
    try {
      setSelectedScenario(scenarioName);
      if (wsRef.current && wsStatus === 'CONNECTED') {
        wsRef.current.setScenario(scenarioName);
      } else {
        const updatedEnv = await selectScenario(scenarioName);
        setEnvironment(updatedEnv);
        setTick(updatedEnv.tick);
      }
      showToast(`Activated scenario: ${scenarioName.replace(/_/g, ' ')}`);
    } catch (e) {
      console.error('Failed to change scenario:', e);
      showToast('Error changing scenario');
    }
  };

  // Toggle Live Simulation
  const handleToggleSimulate = () => {
    if (!wsRef.current) return;
    if (isSimulating) {
      wsRef.current.pauseSimulation();
      setIsSimulating(false);
      showToast('Simulation paused');
    } else {
      wsRef.current.startSimulation(simInterval);
      setIsSimulating(true);
      showToast('Streaming real-time telemetry and offloading decisions');
    }
  };

  // Manual Clock Step
  const handleTriggerStep = async () => {
    if (wsRef.current && wsStatus === 'CONNECTED') {
      wsRef.current.triggerStep();
    } else {
      try {
        const updatedEnv = await triggerTick();
        setEnvironment(updatedEnv);
        setTick(updatedEnv.tick);
      } catch (e) {
        console.error('Failed to advance tick:', e);
      }
    }
  };

  // Run Custom or Benchmark Task Offload
  const handleRunOffload = async (payload) => {
    setIsLoading(true);
    try {
      const res = await runOffloadDecision(payload);
      setWorkflowState(res);
      if (res.environment_snapshot) {
        setEnvironment(res.environment_snapshot);
        setTick(res.environment_snapshot.tick);
      }
      if (res.decision) {
        setHistory((prev) => [res.decision, ...prev.slice(0, 49)]);
      }
      // Refresh stats
      const updatedStats = await getOffloadStats().catch(() => null);
      if (updatedStats) setStats(updatedStats);

      // Display notification in the dedicated region next to action buttons
      setDecisionNotification({
        text: `Decision executed: Selected ${res.decision?.selected_tier}`,
        tier: res.decision?.selected_tier,
      });
      if (decisionNotificationTimeoutRef.current) {
        clearTimeout(decisionNotificationTimeoutRef.current);
      }
      decisionNotificationTimeoutRef.current = setTimeout(() => {
        setDecisionNotification(null);
      }, 3000);
    } catch (e) {
      console.error('Error running offload decision:', e);
      setDecisionNotification({
        text: `Offload failed: ${e.message}`,
        isError: true,
      });
      if (decisionNotificationTimeoutRef.current) {
        clearTimeout(decisionNotificationTimeoutRef.current);
      }
      decisionNotificationTimeoutRef.current = setTimeout(() => {
        setDecisionNotification(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }

  };

  // Generate Synthetic Task Batch
  const handleGenerateBatch = async (count) => {
    setIsLoading(true);
    try {
      const generated = await generateTasks(count);
      setBenchmarks((prev) => [...generated, ...prev]);
      const summary = await getBenchmarksSummary().catch(() => null);
      if (summary) setBenchmarksSummary(summary);
      showToast(`Generated ${generated.length} synthetic benchmark tasks`);
    } catch (e) {
      console.error('Failed to generate batch:', e);
      showToast('Batch generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* General System Toast Notification (Scenarios, Simulation, Batch) */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#FFFFFF',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-color)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          zIndex: 1000,
          fontSize: '0.8125rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'toastFadeIn 0.2s ease forwards',
          pointerEvents: 'none',
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}



      {/* Top Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scenarios={scenarios}
        selectedScenario={selectedScenario}
        onSelectScenario={handleSelectScenario}
        isSimulating={isSimulating}
        onToggleSimulate={handleToggleSimulate}
        onTriggerStep={handleTriggerStep}
        tick={tick}
        wsStatus={wsStatus}
        simInterval={simInterval}
        setSimInterval={setSimInterval}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'topology' && (
          <TopologyOverview
            environment={environment}
            latestDecision={workflowState?.decision || history[0]}
          />
        )}

        {activeTab === 'pipeline' && (
          <WorkflowPipeline
            workflowState={workflowState}
          />
        )}

        {activeTab === 'sandbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <TaskRunner
              benchmarks={benchmarks}
              onRunOffload={handleRunOffload}
              isLoading={isLoading}
              decisionNotification={decisionNotification}
            />
            {workflowState && (
              <WorkflowPipeline workflowState={workflowState} />
            )}
          </div>
        )}

        {activeTab === 'cost' && (
          <CostComparisonMatrix
            costEvaluation={workflowState?.cost_evaluation}
            latestDecision={workflowState?.decision || history[0]}
          />
        )}

        {activeTab === 'history' && (
          <DecisionHistory
            history={history}
            stats={stats}
            onSelectDecision={(dec) => setSelectedDecisionModal(dec)}
          />
        )}

        {activeTab === 'benchmarks' && (
          <BenchmarkCatalog
            benchmarks={benchmarks}
            summary={benchmarksSummary}
            onGenerateBatch={handleGenerateBatch}
            onRunBenchmark={(taskId) => {
              handleRunOffload({ task_id: taskId });
              setActiveTab('sandbox');
            }}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Decision Detail Modal */}
      {selectedDecisionModal && (
        <DecisionDetailModal
          decision={selectedDecisionModal}
          explanation={workflowState?.decision?.decision_id === selectedDecisionModal.decision_id ? workflowState.explanation : null}
          onClose={() => setSelectedDecisionModal(null)}
        />
      )}
    </div>
  );
}
