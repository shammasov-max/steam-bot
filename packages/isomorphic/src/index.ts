// ============= Base utilities =============
export { 
  createEntitySlice,
  addEntity,
  removeEntity,
  updateEntity,
  isEntityWithId,
  type EntityWithId,
  type EntityState,
  type EntityActionPayload,
  type EntityReducer,
  type EntityReducersMap,
  type CreateEntitySliceConfig
} from './base/createEntitySlice';

// ============= Entity Slices =============
export * from './slices';

// ============= Store setup helpers =============
export { sliceReducers, sliceActions, sliceSelectors, type RootState } from './slices';

