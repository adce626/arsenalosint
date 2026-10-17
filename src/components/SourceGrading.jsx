import {
  RELIABILITY_LEVELS,
  CREDIBILITY_LEVELS,
  admiraltyCode,
} from '../sourceGrading.js';

/**
 * Two-axis Admiralty source-grading selector. `onChange` receives a partial
 * patch ({ reliability } or { credibility }).
 */
export default function SourceGrading({ reliability, credibility, onChange }) {
  const code = admiraltyCode(reliability, credibility);
  return (
    <fieldset className="field-group">
      <legend>Source grading</legend>
      <div className="source-grading-row">
        <label className="field">
          <span>Source reliability</span>
          <select
            value={reliability ?? ''}
            onChange={(e) => onChange({ reliability: e.target.value })}
          >
            {RELIABILITY_LEVELS.map((level) => (
              <option key={level.id || 'none'} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Information credibility</span>
          <select
            value={credibility ?? ''}
            onChange={(e) => onChange({ credibility: e.target.value })}
          >
            {CREDIBILITY_LEVELS.map((level) => (
              <option key={level.id || 'none'} value={level.id}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
        <div className="source-grading-code" aria-hidden={!code}>
          {code || '–'}
        </div>
      </div>
      <p className="field-hint">
        Admiralty code: <strong>A</strong> = completely reliable source,{' '}
        <strong>1</strong> = confirmed information. Leave both unrated when you
        have no basis to judge.
      </p>
    </fieldset>
  );
}
