export interface IconEntry {
  name: string;
  label: string;
  category: string;
}

export const ICON_SET: IconEntry[] = [
  // Process & Workflow
  { name: 'circle-dot', label: 'Default', category: 'Process' },
  { name: 'check-circle', label: 'Complete', category: 'Process' },
  { name: 'circle-check', label: 'Verified', category: 'Process' },
  { name: 'circle-x', label: 'Rejected', category: 'Process' },
  { name: 'circle-pause', label: 'Paused', category: 'Process' },
  { name: 'play-circle', label: 'Start', category: 'Process' },
  { name: 'arrow-right', label: 'Next', category: 'Process' },
  { name: 'arrow-right-left', label: 'Exchange', category: 'Process' },
  { name: 'refresh-cw', label: 'Loop / Cycle', category: 'Process' },
  { name: 'repeat', label: 'Repeat', category: 'Process' },
  { name: 'workflow', label: 'Workflow', category: 'Process' },
  { name: 'route', label: 'Route', category: 'Process' },
  { name: 'milestone', label: 'Milestone', category: 'Process' },

  // Planning & Meetings
  { name: 'calendar', label: 'Calendar', category: 'Planning' },
  { name: 'calendar-check', label: 'Scheduled', category: 'Planning' },
  { name: 'clock', label: 'Time', category: 'Planning' },
  { name: 'timer', label: 'Timer', category: 'Planning' },
  { name: 'presentation', label: 'Presentation', category: 'Planning' },
  { name: 'gantt-chart', label: 'Gantt Chart', category: 'Planning' },
  { name: 'kanban', label: 'Kanban', category: 'Planning' },

  // Decision & Analysis
  { name: 'scale', label: 'Decision / Balance', category: 'Decision' },
  { name: 'shield-check', label: 'Security Check', category: 'Decision' },
  { name: 'shield', label: 'Shield', category: 'Decision' },
  { name: 'thumbs-up', label: 'Approved', category: 'Decision' },
  { name: 'thumbs-down', label: 'Rejected', category: 'Decision' },
  { name: 'alert-triangle', label: 'Warning', category: 'Decision' },
  { name: 'alert-circle', label: 'Alert', category: 'Decision' },
  { name: 'ban', label: 'Blocked', category: 'Decision' },
  { name: 'flag', label: 'Flag', category: 'Decision' },

  // Documents & Data
  { name: 'file-text', label: 'Document', category: 'Documents' },
  { name: 'file-check', label: 'Approved Doc', category: 'Documents' },
  { name: 'file-search', label: 'Review Doc', category: 'Documents' },
  { name: 'file-code', label: 'Code File', category: 'Documents' },
  { name: 'file-plus', label: 'New Doc', category: 'Documents' },
  { name: 'files', label: 'Multiple Files', category: 'Documents' },
  { name: 'clipboard-list', label: 'Checklist', category: 'Documents' },
  { name: 'clipboard-check', label: 'Checked List', category: 'Documents' },
  { name: 'notebook-pen', label: 'Notes', category: 'Documents' },
  { name: 'book-open', label: 'Documentation', category: 'Documents' },

  // People & Communication
  { name: 'users', label: 'Team', category: 'People' },
  { name: 'user', label: 'Person', category: 'People' },
  { name: 'user-check', label: 'Assigned', category: 'People' },
  { name: 'user-plus', label: 'Add Member', category: 'People' },
  { name: 'message-square', label: 'Discussion', category: 'People' },
  { name: 'messages-square', label: 'Chat', category: 'People' },
  { name: 'mail', label: 'Email', category: 'People' },
  { name: 'phone', label: 'Call', category: 'People' },
  { name: 'video', label: 'Video Call', category: 'People' },

  // Development
  { name: 'code', label: 'Code', category: 'Development' },
  { name: 'terminal', label: 'Terminal', category: 'Development' },
  { name: 'git-branch', label: 'Branch', category: 'Development' },
  { name: 'git-merge', label: 'Merge', category: 'Development' },
  { name: 'git-pull-request', label: 'Pull Request', category: 'Development' },
  { name: 'git-commit', label: 'Commit', category: 'Development' },
  { name: 'bug', label: 'Bug', category: 'Development' },
  { name: 'wrench', label: 'Fix / Tool', category: 'Development' },
  { name: 'settings', label: 'Settings', category: 'Development' },
  { name: 'cog', label: 'Config', category: 'Development' },
  { name: 'puzzle', label: 'Integration', category: 'Development' },
  { name: 'blocks', label: 'Components', category: 'Development' },
  { name: 'database', label: 'Database', category: 'Development' },
  { name: 'server', label: 'Server', category: 'Development' },
  { name: 'cloud', label: 'Cloud', category: 'Development' },

  // Testing & Quality
  { name: 'test-tube', label: 'Testing', category: 'Quality' },
  { name: 'test-tubes', label: 'Test Suite', category: 'Quality' },
  { name: 'microscope', label: 'Inspect', category: 'Quality' },
  { name: 'search', label: 'Search / Review', category: 'Quality' },
  { name: 'scan-search', label: 'Scan', category: 'Quality' },
  { name: 'list-checks', label: 'Checklist', category: 'Quality' },
  { name: 'badge-check', label: 'Certified', category: 'Quality' },

  // Metrics & Charts
  { name: 'bar-chart-3', label: 'Bar Chart', category: 'Metrics' },
  { name: 'trending-up', label: 'Trending Up', category: 'Metrics' },
  { name: 'trending-down', label: 'Trending Down', category: 'Metrics' },
  { name: 'activity', label: 'Activity', category: 'Metrics' },
  { name: 'pie-chart', label: 'Pie Chart', category: 'Metrics' },
  { name: 'calculator', label: 'Calculator', category: 'Metrics' },
  { name: 'ruler', label: 'Measure', category: 'Metrics' },
  { name: 'gauge', label: 'Gauge', category: 'Metrics' },
  { name: 'target', label: 'Target', category: 'Metrics' },
  { name: 'zap', label: 'Performance', category: 'Metrics' },

  // Deployment & Ops
  { name: 'rocket', label: 'Deploy / Launch', category: 'Deployment' },
  { name: 'package', label: 'Package', category: 'Deployment' },
  { name: 'box', label: 'Container', category: 'Deployment' },
  { name: 'upload', label: 'Upload', category: 'Deployment' },
  { name: 'download', label: 'Download', category: 'Deployment' },
  { name: 'globe', label: 'Production', category: 'Deployment' },
  { name: 'monitor', label: 'Monitor', category: 'Deployment' },
  { name: 'eye', label: 'Observe', category: 'Deployment' },
  { name: 'lock', label: 'Security', category: 'Deployment' },
  { name: 'unlock', label: 'Unlock', category: 'Deployment' },
  { name: 'key', label: 'Key / Auth', category: 'Deployment' },

  // Layout
  { name: 'columns-2', label: 'Parallel Columns', category: 'Layout' },
  { name: 'layers', label: 'Layers', category: 'Layout' },
  { name: 'layout-grid', label: 'Grid', category: 'Layout' },

  // General
  { name: 'star', label: 'Star', category: 'General' },
  { name: 'heart', label: 'Heart', category: 'General' },
  { name: 'lightbulb', label: 'Idea', category: 'General' },
  { name: 'sparkles', label: 'New', category: 'General' },
  { name: 'trophy', label: 'Achievement', category: 'General' },
  { name: 'crown', label: 'Priority', category: 'General' },
  { name: 'bookmark', label: 'Bookmark', category: 'General' },
  { name: 'link', label: 'Link', category: 'General' },
  { name: 'external-link', label: 'External Link', category: 'General' },
  { name: 'image', label: 'Image', category: 'General' },
  { name: 'folder', label: 'Folder', category: 'General' },
  { name: 'trash-2', label: 'Delete', category: 'General' },
  { name: 'plus', label: 'Add', category: 'General' },
  { name: 'minus', label: 'Remove', category: 'General' },
  { name: 'x', label: 'Close', category: 'General' },
  { name: 'more-horizontal', label: 'More', category: 'General' },
  { name: 'info', label: 'Info', category: 'General' },
  { name: 'help-circle', label: 'Help', category: 'General' },
];

export const ICON_CATEGORIES = [...new Set(ICON_SET.map(i => i.category))];
