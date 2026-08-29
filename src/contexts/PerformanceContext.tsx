import React, { createContext, useContext, useReducer, useMemo, useCallback, memo } from 'react';

// Performance state interface
interface PerformanceState {
  isLoading: boolean;
  imageCache: Map<string, boolean>;
  componentCache: Map<string, any>;
  scrollPositions: Map<string, number>;
  prefetchedData: Map<string, any>;
}

// Action types for performance optimization
type PerformanceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CACHE_IMAGE'; payload: { url: string; loaded: boolean } }
  | { type: 'CACHE_COMPONENT'; payload: { key: string; data: any } }
  | { type: 'SAVE_SCROLL_POSITION'; payload: { route: string; position: number } }
  | { type: 'PREFETCH_DATA'; payload: { key: string; data: any } }
  | { type: 'CLEAR_CACHE'; payload?: string };

// Initial state
const initialState: PerformanceState = {
  isLoading: false,
  imageCache: new Map(),
  componentCache: new Map(),
  scrollPositions: new Map(),
  prefetchedData: new Map(),
};

// Performance reducer with optimized state updates
const performanceReducer = (state: PerformanceState, action: PerformanceAction): PerformanceState => {
  switch (action.type) {
    case 'SET_LOADING':
      return state.isLoading === action.payload ? state : { ...state, isLoading: action.payload };

    case 'CACHE_IMAGE': {
      const newImageCache = new Map(state.imageCache);
      newImageCache.set(action.payload.url, action.payload.loaded);
      return { ...state, imageCache: newImageCache };
    }

    case 'CACHE_COMPONENT': {
      const newComponentCache = new Map(state.componentCache);
      newComponentCache.set(action.payload.key, action.payload.data);
      return { ...state, componentCache: newComponentCache };
    }

    case 'SAVE_SCROLL_POSITION': {
      const newScrollPositions = new Map(state.scrollPositions);
      newScrollPositions.set(action.payload.route, action.payload.position);
      return { ...state, scrollPositions: newScrollPositions };
    }

    case 'PREFETCH_DATA': {
      const newPrefetchedData = new Map(state.prefetchedData);
      newPrefetchedData.set(action.payload.key, action.payload.data);
      return { ...state, prefetchedData: newPrefetchedData };
    }

    case 'CLEAR_CACHE': {
      if (action.payload) {
        const newComponentCache = new Map(state.componentCache);
        newComponentCache.delete(action.payload);
        return { ...state, componentCache: newComponentCache };
      }
      return {
        ...state,
        imageCache: new Map(),
        componentCache: new Map(),
        prefetchedData: new Map(),
      };
    }

    default:
      return state;
  }
};

// Context interfaces
interface PerformanceContextValue {
  state: PerformanceState;
  setLoading: (loading: boolean) => void;
  cacheImage: (url: string, loaded: boolean) => void;
  cacheComponent: (key: string, data: any) => void;
  saveScrollPosition: (route: string, position: number) => void;
  getScrollPosition: (route: string) => number;
  prefetchData: (key: string, data: any) => void;
  getPrefetchedData: (key: string) => any;
  clearCache: (key?: string) => void;
  isImageCached: (url: string) => boolean;
  isComponentCached: (key: string) => boolean;
}

// Create contexts
const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

// Performance provider component
interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider = memo(({ children }: PerformanceProviderProps) => {
  const [state, dispatch] = useReducer(performanceReducer, initialState);

  // Memoized action creators
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const cacheImage = useCallback((url: string, loaded: boolean) => {
    dispatch({ type: 'CACHE_IMAGE', payload: { url, loaded } });
  }, []);

  const cacheComponent = useCallback((key: string, data: any) => {
    dispatch({ type: 'CACHE_COMPONENT', payload: { key, data } });
  }, []);

  const saveScrollPosition = useCallback((route: string, position: number) => {
    dispatch({ type: 'SAVE_SCROLL_POSITION', payload: { route, position } });
  }, []);

  const getScrollPosition = useCallback((route: string): number => {
    return state.scrollPositions.get(route) || 0;
  }, [state.scrollPositions]);

  const prefetchData = useCallback((key: string, data: any) => {
    dispatch({ type: 'PREFETCH_DATA', payload: { key, data } });
  }, []);

  const getPrefetchedData = useCallback((key: string): any => {
    return state.prefetchedData.get(key);
  }, [state.prefetchedData]);

  const clearCache = useCallback((key?: string) => {
    dispatch({ type: 'CLEAR_CACHE', payload: key });
  }, []);

  const isImageCached = useCallback((url: string): boolean => {
    return state.imageCache.has(url);
  }, [state.imageCache]);

  const isComponentCached = useCallback((key: string): boolean => {
    return state.componentCache.has(key);
  }, [state.componentCache]);

  // Memoized context value
  const contextValue = useMemo<PerformanceContextValue>(() => ({
    state,
    setLoading,
    cacheImage,
    cacheComponent,
    saveScrollPosition,
    getScrollPosition,
    prefetchData,
    getPrefetchedData,
    clearCache,
    isImageCached,
    isComponentCached,
  }), [
    state,
    setLoading,
    cacheImage,
    cacheComponent,
    saveScrollPosition,
    getScrollPosition,
    prefetchData,
    getPrefetchedData,
    clearCache,
    isImageCached,
    isComponentCached,
  ]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
});

PerformanceProvider.displayName = 'PerformanceProvider';

// Custom hook to use performance context
export const usePerformance = (): PerformanceContextValue => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// HOC for performance optimization
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>,
  cacheKey?: string
) => {
  const WrappedComponent = memo((props: P) => {
    const { isComponentCached, cacheComponent } = usePerformance();
    
    const key = cacheKey || Component.displayName || Component.name || 'anonymous';
    
    // Cache component result if needed
    const cachedResult = useMemo(() => {
      if (isComponentCached(key)) {
        return null; // Return cached version
      }
      
      const result = <Component {...props} />;
      cacheComponent(key, result);
      return result;
    }, [props, key, isComponentCached, cacheComponent]);
    
    return cachedResult || <Component {...props} />;
  });
  
  WrappedComponent.displayName = `withPerformanceOptimization(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useMemo(() => performance.now(), []);
  
  React.useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // More than one frame (60fps)
      console.warn(`Performance warning: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }
  });
  
  return { startTime };
};