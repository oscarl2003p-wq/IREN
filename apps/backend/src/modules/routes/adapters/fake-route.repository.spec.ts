import { Test, TestingModule } from '@nestjs/testing';
import { FakeRouteRepository } from './fake-route.repository';

describe('FakeRouteRepository', () => {
  let repository: FakeRouteRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FakeRouteRepository],
    }).compile();

    repository = module.get<FakeRouteRepository>(FakeRouteRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return a route for a valid patientId', async () => {
    const route = await repository.findRouteByPatientId('1');
    expect(route).toBeDefined();
    expect(route?.currentProgress).toBe(50);
    expect(route?.steps.length).toBe(4);
  });

  it('should return null for an invalid patientId', async () => {
    const route = await repository.findRouteByPatientId('invalid');
    expect(route).toBeNull();
  });
});
