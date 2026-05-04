import { FlowService } from './flow.service';

describe('FlowService', () => {
  let flowService: FlowService;

  let prismaMock: {
    flow: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  let versionServiceMock: {
    createVersion: jest.Mock;
    createVersionForCollaborator: jest.Mock;
    getLatestVersion: jest.Mock;
  };

  let auditServiceMock: {
    logCreation: jest.Mock;
    logSave: jest.Mock;
    detectAndLogChanges: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      flow: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    versionServiceMock = {
      createVersion: jest.fn(),
      createVersionForCollaborator: jest.fn(),
      getLatestVersion: jest.fn(),
    };

    auditServiceMock = {
      logCreation: jest.fn(),
      logSave: jest.fn(),
      detectAndLogChanges: jest.fn(),
    };

    flowService = new FlowService(prismaMock as any, versionServiceMock as any, auditServiceMock as any);
  });

  it('TC-FLOW-001 creates a version, writes the audit log, and persists manual saves', async () => {
    // TC-FLOW-001
    const existingFlow = {
      id: 'flow-1',
      userId: 'user-1',
      name: 'Canvas draft',
      nodes: [{ id: 'old-node' }],
      edges: [{ id: 'old-edge' }],
    };

    const updatedNodes = [{ id: 'new-node' }];
    const updatedEdges = [{ id: 'new-edge' }];

    jest.spyOn(flowService, 'findOne').mockResolvedValue(existingFlow as any);
    versionServiceMock.createVersion.mockResolvedValue({ id: 'version-1' });
    auditServiceMock.logSave.mockResolvedValue({ id: 'audit-1' });
    auditServiceMock.detectAndLogChanges.mockResolvedValue(undefined);
    prismaMock.flow.update.mockResolvedValue({ ...existingFlow, name: 'Canvas published' });

    const result = await flowService.update(
      'user-1',
      'flow-1',
      {
        name: 'Canvas published',
        nodes: updatedNodes,
        edges: updatedEdges,
        isManualSave: true,
      } as any,
      true,
    );

    expect(versionServiceMock.createVersion).toHaveBeenCalledWith(
      'flow-1',
      'user-1',
      updatedNodes,
      updatedEdges,
      undefined,
      false,
    );
    expect(auditServiceMock.logSave).toHaveBeenCalledWith('flow-1', 'user-1', 'version-1', {
      nodeCount: 1,
      edgeCount: 1,
    });
    expect(auditServiceMock.detectAndLogChanges).toHaveBeenCalledWith(
      'flow-1',
      'user-1',
      existingFlow.nodes,
      existingFlow.edges,
      updatedNodes,
      updatedEdges,
    );
    expect(prismaMock.flow.update).toHaveBeenCalledWith({
      where: { id: 'flow-1' },
      data: {
        name: 'Canvas published',
        nodes: updatedNodes,
        edges: updatedEdges,
      },
    });
    expect(result).toEqual({ ...existingFlow, name: 'Canvas published' });
  });

  it('TC-FLOW-002 updates the flow without snapshot hooks when the save is not manual', async () => {
    // TC-FLOW-002
    const existingFlow = {
      id: 'flow-2',
      userId: 'user-1',
      name: 'Autosave draft',
      nodes: [],
      edges: [],
    };

    jest.spyOn(flowService, 'findOne').mockResolvedValue(existingFlow as any);
    prismaMock.flow.update.mockResolvedValue({ ...existingFlow, name: 'Autosave draft v2' });

    await flowService.update(
      'user-1',
      'flow-2',
      {
        name: 'Autosave draft v2',
      } as any,
      false,
    );

    expect(versionServiceMock.createVersion).not.toHaveBeenCalled();
    expect(auditServiceMock.logSave).not.toHaveBeenCalled();
    expect(auditServiceMock.detectAndLogChanges).not.toHaveBeenCalled();
    expect(prismaMock.flow.update).toHaveBeenCalledWith({
      where: { id: 'flow-2' },
      data: {
        name: 'Autosave draft v2',
      },
    });
  });
});