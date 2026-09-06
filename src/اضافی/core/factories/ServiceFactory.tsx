// src/core/factories/ServiceFactory.ts

import { ProvinceService } from '../../services/ProvinceService';
import { CityService } from '../../services/CityService';
import { UniversityService } from '../../services/UniversityService';
// ✅ اینجا CommunicationService رو import کن
import { CommunicationService } from '../../services/CommunicationService';
import type { IGenericService } from '../interfaces/IGenericService';
import type { Province, City, University, Communication } from '../../types';

export type ServiceType = 'province' | 'city' | 'university' | 'communication';

export class ServiceFactory {
  private static instances: Map<ServiceType, IGenericService<any>> = new Map();

  static getService<T = any>(type: ServiceType): IGenericService<T> {
    if (this.instances.has(type)) {
      return this.instances.get(type) as IGenericService<T>;
    }

    let service: IGenericService<any>;
    switch (type) {
      case 'province':
        service = new ProvinceService();
        break;
      case 'city':
        service = new CityService();
        break;
      case 'university':
        service = new UniversityService();
        break;
      case 'communication':
        service = new CommunicationService(); // ✅ اینجا
        break;
      default:
        throw new Error(`Unknown service type: ${type}`);
    }

    this.instances.set(type, service);
    return service as unknown as IGenericService<T>;
  }
}
