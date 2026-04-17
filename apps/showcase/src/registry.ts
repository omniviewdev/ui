import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import {
  LuFolder,
  LuGlobe,
  LuCode,
  LuBot,
  LuFileText,
  LuContainer,
  LuMessageCircle,
  LuCalendarClock,
} from 'react-icons/lu';

export interface DemoApp {
  id: string;
  name: string;
  description: string;
  icon: ComponentType;
  component: LazyExoticComponent<ComponentType>;
}

export const apps: DemoApp[] = [
  {
    id: 'file-explorer',
    name: 'File Explorer',
    description: 'Navigate local and remote filesystems',
    icon: LuFolder,
    component: lazy(() => import('./demos/file-explorer')),
  },
  {
    id: 'web-browser',
    name: 'Web Browser',
    description: 'Tabbed browsing with groups and bookmarks',
    icon: LuGlobe,
    component: lazy(() => import('./demos/web-browser')),
  },
  {
    id: 'ide-editor',
    name: 'IDE Editor',
    description: 'Code editing with file tree and terminal',
    icon: LuCode,
    component: lazy(() => import('./demos/ide-editor')),
  },
  {
    id: 'ai-chat',
    name: 'AI Chat',
    description: 'Conversational AI with streaming and tool use',
    icon: LuBot,
    component: lazy(() => import('./demos/ai-chat')),
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Markdown note-taking with live preview',
    icon: LuFileText,
    component: lazy(() => import('./demos/notes')),
  },
  {
    id: 'container-management',
    name: 'Containers',
    description: 'Docker-style container dashboard',
    icon: LuContainer,
    component: lazy(() => import('./demos/container-management')),
  },
  {
    id: 'chat-app',
    name: 'Chat',
    description: 'Team messaging with channels and threads',
    icon: LuMessageCircle,
    component: lazy(() => import('./demos/chat-app')),
  },
  {
    id: 'date-time-pickers',
    name: 'Date & Time Pickers',
    description: 'Interactive demo of DatePicker, TimePicker, and DateTimePicker',
    icon: LuCalendarClock,
    component: lazy(() => import('./demos/date-time-pickers')),
  },
];
