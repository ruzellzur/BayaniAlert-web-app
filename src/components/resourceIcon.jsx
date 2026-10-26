import {
  PowerIcon,
  WaterIcon,
  ToolsIcon,
  FirstAidIcon,
  TransportIcon,
} from './icons';

/**
 * Renders the icon for a resource category.
 *
 * Kept as a component (not a helper returning JSX) so this module stays a
 * component-only file — the react-refresh lint rule requires it.
 */
const CATEGORY_ICONS = {
  power: PowerIcon,
  water: WaterIcon,
  tools: ToolsIcon,
  firstaid: FirstAidIcon,
  transport: TransportIcon,
};

export default function ResourceIcon({ category }) {
  const Icon = CATEGORY_ICONS[category] || ToolsIcon;
  return <Icon />;
}
