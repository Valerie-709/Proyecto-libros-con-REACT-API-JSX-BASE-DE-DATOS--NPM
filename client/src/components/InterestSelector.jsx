import { INTEREST_OPTIONS, MAX_INTERESTS } from '../data/interests.js'

function InterestSelector({ selectedInterests, onToggle, disabled }) {
  return (
    <fieldset className="interest-fieldset" disabled={disabled}>
      <legend className="visually-hidden">Selecciona tus intereses de lectura</legend>
      <div className="interest-grid">
        {INTEREST_OPTIONS.map((interest) => {
          const checked = selectedInterests.includes(interest.id)
          const atLimit =
            selectedInterests.length >= MAX_INTERESTS && !checked

          return (
            <label
              className={`interest-option${checked ? ' is-selected' : ''}`}
              style={{ '--interest-image': `url("${interest.image}")` }}
              key={interest.id}
            >
              <input
                type="checkbox"
                name="interests"
                value={interest.id}
                checked={checked}
                disabled={atLimit}
                onChange={() => onToggle(interest.id)}
              />
              <span className="interest-symbol" aria-hidden="true">
                {interest.symbol}
              </span>
              <span className="interest-label">{interest.label}</span>
              <span className="interest-description">{interest.description}</span>
            </label>
          )
        })}
      </div>
      <p className="selection-hint">
        Puedes combinar hasta {MAX_INTERESTS} intereses.
      </p>
    </fieldset>
  )
}

export default InterestSelector
