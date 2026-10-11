/**
 * Groww Goals - State Management
 * Persistent localStorage state with reactive updates
 */

"use strict";

const STORAGE_KEY = "groww_goals_v2";

export const defaultState = {
  theme: "dark",
  riskLevel: "medium", // low | medium | high
  activeTab: "goals",
  goals: [],           // saved user goals
};

let _state = null;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      _state = { ...defaultState, ...JSON.parse(raw) };
    } else {
      _state = { ...defaultState };
    }
  } catch (e) {
    _state = { ...defaultState };
  }
  return _state;
}

export function getState() {
  if (!_state) loadState();
  return _state;
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (e) {
    console.warn("Storage save error", e);
  }
}

export function setState(updates) {
  _state = { ..._state, ...updates };
  saveState();
  return _state;
}

export function addGoal(goal) {
  const goals = [...(_state.goals || [])];
  const newGoal = {
    ...goal,
    id: "g_" + Date.now().toString(),
    createdAt: new Date().toISOString(),
    currentAmount: goal.alreadySaved || 0,
    checkins: [],
  };
  goals.unshift(newGoal); // newer first
  setState({ goals });
  return newGoal;
}

export function updateGoal(id, updates) {
  const goals = (_state.goals || []).map(g =>
    g.id === id ? { ...g, ...updates } : g
  );
  setState({ goals });
}

export function getGoal(id) {
  return (_state.goals || []).find(g => g.id === id) || null;
}

export function deleteGoal(id) {
  const goals = (_state.goals || []).filter(g => g.id !== id);
  setState({ goals });
}

export function addCheckin(goalId, checkin) {
  const goals = (_state.goals || []).map(g => {
    if (g.id !== goalId) return g;
    return {
      ...g,
      checkins: [...(g.checkins || []), { ...checkin, date: new Date().toISOString() }],
      currentAmount: checkin.currentAmount !== undefined ? checkin.currentAmount : g.currentAmount,
    };
  });
  setState({ goals });
}

export function clearAllGoals() {
  setState({ goals: [] });
}
