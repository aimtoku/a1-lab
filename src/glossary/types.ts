/**
 * 用語。aliases に書いた文字列が本文に出てくると、その用語として扱う
 * （大文字・小文字を区別した完全一致。長いものから優先して照合する）。
 */
export interface Term {
  id: string
  name: string
  aliases: readonly string[]
  description: string
}
