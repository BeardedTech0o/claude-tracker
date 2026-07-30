import TokenInput from './TokenInput'
import AccentPicker from './AccentPicker'

interface SettingsScreenProps {
  onClose: () => void
}

function SettingsScreen({ onClose }: SettingsScreenProps): React.JSX.Element {
  return (
    <section className="settings-screen">
      <header className="settings-screen__header">
        <h2>Settings</h2>
        <button type="button" onClick={onClose}>
          Done
        </button>
      </header>

      <TokenInput />
      <AccentPicker />
    </section>
  )
}

export default SettingsScreen
