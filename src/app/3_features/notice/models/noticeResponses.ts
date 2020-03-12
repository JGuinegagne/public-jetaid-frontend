import { BackendResponse } from 'src/app/1_constants/backend-responses';
import { TaskNoticeResponse } from './task-notice';

export interface AllNoticeBackendResponse extends BackendResponse{
  taskNotices?: TaskNoticeResponse[]
}