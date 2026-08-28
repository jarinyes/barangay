import { useContext, useMemo } from 'react';
import { UIContext } from '../context/UIContext';
import { CaseContext } from '../context/CaseContext';
import { buildGraphFromCases } from '../utils/graphEngine';

export const useUI = () => {
  const uiState = useContext(UIContext);
  const caseState = useContext(CaseContext);

  if (!uiState) {
    throw new Error('useUI must be used within UIProvider');
  }

  const { cases } = caseState || { cases: [] };

  const graphData = useMemo(() => {
    return buildGraphFromCases(cases);
  }, [cases]);

  const openEditAccountModal = (user?: any) => {
    if (user) {
      uiState.setUserToEdit(user);
    }
    uiState.setIsEditAccountModalOpen(true);
  };

  return {
    ...uiState,
    graphData,
    openEditAccountModal
  };
};
