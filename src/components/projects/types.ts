
import { Project } from '@/lib/types';

export interface ProjectWithStage extends Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  stage?: 'planning' | 'inProgress' | 'review' | 'completed';
  reviewCount?: number;
  reviewScore?: number;
}

export type ProjectStage = 'planning' | 'inProgress' | 'review' | 'completed';
