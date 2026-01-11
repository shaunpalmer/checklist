const instance = new ItemInstance({
  instanceId: crypto.randomUUID(),
  definitionId: 'service.windows.large_pane',
  checked: true,
  propertyScope: true,
  serviceType: 'Commercial',
  difficulty: 'medium',          // runtime editable
  params: { number_of_large_panes: 6 },
  notes: '',
});
store.upsert(instance);
