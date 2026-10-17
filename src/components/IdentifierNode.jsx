import { Handle, Position } from '@xyflow/react';
import IdentifierBadge from './IdentifierBadge.jsx';
import {
  getTypeDef,
  getDisplayLabel,
  getSecondaryLabel,
} from '../identifierTypes.js';
import { confidenceColor, confidenceLabel } from '../confidence.js';
import './IdentifierNode.css';

const SIDES = [
  { position: Position.Top, id: 'top' },
  { position: Position.Right, id: 'right' },
  { position: Position.Bottom, id: 'bottom' },
  { position: Position.Left, id: 'left' },
];

export default function IdentifierNode({ data, selected }) {
  const identifier = data.identifier;
  const def = getTypeDef(identifier.type);
  const display = getDisplayLabel(identifier);
  const secondary = getSecondaryLabel(identifier);
  const color = data.color;
  const conf = confidenceColor(identifier.confidence);

  return (
    <div className={`id-node ${selected ? 'selected' : ''}`}>
      {color && (
        <span
          className="id-node-accent"
          style={{ background: color }}
          aria-hidden="true"
        />
      )}
      {SIDES.map(({ position, id }) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          className="id-node-handle"
        />
      ))}
      <IdentifierBadge
        typeKey={identifier.type}
        customIconId={identifier.customIconId}
        size="md"
      />
      <div className="id-node-body">
        <div className="id-node-type">{def.label}</div>
        <div className="id-node-label">{display}</div>
        {secondary && <div className="id-node-secondary">{secondary}</div>}
      </div>
      {conf && (
        <span
          className="id-node-confidence"
          style={{ background: conf }}
          title={`Confidence: ${confidenceLabel(identifier.confidence)}`}
          aria-label={`Confidence: ${confidenceLabel(identifier.confidence)}`}
        />
      )}
    </div>
  );
}
