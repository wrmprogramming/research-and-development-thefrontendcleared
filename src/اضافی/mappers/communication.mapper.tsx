// src/mappers/communication.mapper.ts

import type { 
  CommunicationResponseDTO, 
  CommunicationFormDTO, 
  CommunicationCreateDTO, 
  CommunicationUpdateDTO 
} from '../dtos/communication.dto';
import { CommunicationFormDTOFactory, toCommunicationCreateDTO, toCommunicationUpdateDTO } from '../dtos/communication.dto';
import type { Communication } from '../types';

// ========== Mapper برای Communication ==========
export class CommunicationMapper {
  // Response → DTO
  static toDTO(response: Communication): CommunicationResponseDTO {
    return {
      id: response.id,
      title: response.title,
      description: response.description,
      sender: response.sender,
      receiver: response.receiver,
      date: response.date,
      send_date: response.send_date,
      receive_date: response.receive_date,
      attachment: response.attachment,
      letter_file: response.letter_file,
      contract: response.contract,
      research: response.research,
      created_at: response.created_at,
      updated_at: response.updated_at,
    };
  }

  // Response → Form DTO
  static toFormDTO(response: Communication): CommunicationFormDTO {
    return CommunicationFormDTOFactory.createFromResponse(
      this.toDTO(response)
    );
  }

  // Form DTO → Create DTO
  static toCreateDTO(formData: CommunicationFormDTO): CommunicationCreateDTO {
    return toCommunicationCreateDTO(formData);
  }

  // Form DTO → Update DTO
  static toUpdateDTO(formData: CommunicationFormDTO): CommunicationUpdateDTO {
    return toCommunicationUpdateDTO(formData);
  }

  // Form data (raw) → Form DTO
  static toFormDTOFromRaw(data: any): CommunicationFormDTO {
    return CommunicationFormDTOFactory.createFromFormData(data);
  }
}