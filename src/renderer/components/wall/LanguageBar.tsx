import type { RepoLanguage } from '@shared/ipcContract'
import { colorForLabel } from '@renderer/theme/palette'

interface LanguageBarProps {
  languages: RepoLanguage[]
}

function LanguageBar({ languages }: LanguageBarProps): React.JSX.Element | null {
  if (languages.length === 0) return null

  const total = languages.reduce((sum, l) => sum + l.byteCount, 0)
  if (total === 0) return null

  const sorted = [...languages].sort((a, b) => b.byteCount - a.byteCount)

  return (
    <div className="language-bar" role="img" aria-label={`Language breakdown: ${sorted.map((l) => l.language).join(', ')}`}>
      {sorted.map((lang, i) => (
        <div
          key={lang.language}
          className="language-bar__segment"
          style={{
            flexGrow: lang.byteCount,
            background: colorForLabel(lang.language),
            borderTopLeftRadius: i === 0 ? 4 : 0,
            borderBottomLeftRadius: i === 0 ? 4 : 0,
            borderTopRightRadius: i === sorted.length - 1 ? 4 : 0,
            borderBottomRightRadius: i === sorted.length - 1 ? 4 : 0
          }}
          title={`${lang.language}: ${Math.round((lang.byteCount / total) * 100)}%`}
        />
      ))}
    </div>
  )
}

export default LanguageBar
