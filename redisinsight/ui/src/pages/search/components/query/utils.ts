import { monaco } from 'react-monaco-editor'
import * as monacoEditor from 'monaco-editor'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { bufferToString, formatLongName, generateArgsForInsertText, getCommandMarkdown, Nullable } from 'uiSrc/utils'
import {
  buildSuggestion,
  generateDetail,
  removeNotSuggestedArgs
} from 'uiSrc/pages/search/utils'
import { FoundCommandArgument, SearchCommand } from 'uiSrc/pages/search/types'
import { DefinedArgumentName } from 'uiSrc/pages/search/components/query/constants'

export const asSuggestionsRef = (
  suggestions: monacoEditor.languages.CompletionItem[],
  forceHide = true,
  forceShow = true
) => ({
  data: suggestions,
  forceHide,
  forceShow
})

export const getIndexesSuggestions = (indexes: RedisResponseBuffer[], range: monaco.IRange, isNextArgQuery = true) =>
  indexes.map((index) => {
    const value = formatLongName(bufferToString(index))
    const insertQueryQuotes = isNextArgQuery ? " '\${1:query to search}'" : ''

    return {
      label: value || ' ',
      kind: monacoEditor.languages.CompletionItemKind.Snippet,
      insertText: `'${value}'${insertQueryQuotes} `,
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      detail: value || ' ',
    }
  })

export const addFieldAttribute = (attribute: string, type: string) => {
  switch (type) {
    case 'TAG': return `${attribute}:{\${1:tag}}`
    case 'TEXT': return `${attribute}:(\${1:term})`
    case 'NUMERIC': return `${attribute}:[\${1:range}]`
    case 'GEO': return `${attribute}:[\${1:lon} \${2:lat} \${3:radius} \${4:unit}]`
    case 'VECTOR': return `${attribute} \\$\${1:vector}`
    default: return attribute
  }
}

export const getFieldsSuggestions = (
  fields: any[],
  range: monaco.IRange,
  spaceAfter = false,
  withType = false
) =>
  fields.map((field) => {
    const { attribute, type } = field
    const attibuteText = attribute.trim() ? attribute : `\\'${attribute}\\'`
    const insertText = withType ? addFieldAttribute(attibuteText, type) : attibuteText

    return {
      label: attribute || ' ',
      kind: monacoEditor.languages.CompletionItemKind.Reference,
      insertText: `${insertText}${spaceAfter ? ' ' : ''}`,
      insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      detail: attribute || ' ',
    }
  })

const insertFunctionArguments = (args: SearchCommand[]) =>
  generateArgsForInsertText(
    args.map(({ token, optional }) => (optional ? `[${token}]` : (token || ''))) as string[],
    ', '
  )

export const getFunctionsSuggestions = (functions: SearchCommand[], range: monaco.IRange) => functions
  .map(({ token, summary, arguments: args }) => ({
    label: token || '',
    insertText: `${token}(${insertFunctionArguments(args || [])})`,
    insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    kind: monacoEditor.languages.CompletionItemKind.Function,
    detail: summary
  }))

export const getCommandsSuggestions = (commands: SearchCommand[], range: monaco.IRange) =>
  commands.map((command) => buildSuggestion(command, range, {
    detail: generateDetail(command),
    insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: {
      value: getCommandMarkdown(command as any)
    },
  }))

export const getMandatoryArgumentSuggestions = (
  foundArg: FoundCommandArgument,
  fields: any[],
  range: monaco.IRange
): monacoEditor.languages.CompletionItem[] => {
  if (foundArg.stopArg?.name === DefinedArgumentName.field) {
    if (!fields.length) return []
    return getFieldsSuggestions(fields, range, true)
  }

  if (foundArg.isBlocked) return []
  if (foundArg.append?.length) {
    return foundArg.append[0].map((arg: any) => buildSuggestion(arg, range, {
      kind: monacoEditor.languages.CompletionItemKind.Property,
      detail: generateDetail(foundArg?.parent)
    }))
  }

  return []
}

export const getCommandSuggestions = (
  foundArg: Nullable<FoundCommandArgument>,
  allArgs: string[],
  range: monaco.IRange,
) => {
  const appendCommands = foundArg?.append ?? []
  const suggestions = []

  for (let i = 0; i < appendCommands.length; i++) {
    const isLastLevel = i === appendCommands.length - 1
    const filteredFileldArgs = isLastLevel
      ? removeNotSuggestedArgs(allArgs, appendCommands[i])
      : appendCommands[i]

    const leveledSuggestions = filteredFileldArgs
      .map((arg) => buildSuggestion(arg, range, {
        sortText: `${i}`,
        kind: isLastLevel
          ? monacoEditor.languages.CompletionItemKind.Reference
          : monacoEditor.languages.CompletionItemKind.Property,
        detail: generateDetail(arg?.parent)
      }))

    suggestions.push(leveledSuggestions)
  }

  return suggestions.flat()
}

export const getGeneralSuggestions = (
  foundArg: Nullable<FoundCommandArgument>,
  allArgs: string[],
  range: monacoEditor.IRange,
  fields: any[]
): {
  suggestions: monacoEditor.languages.CompletionItem[],
  forceHide?: boolean
  helpWidgetData?: any
} => {
  if (foundArg && !foundArg.isComplete) {
    return {
      suggestions: getMandatoryArgumentSuggestions(foundArg, fields, range),
      helpWidgetData: { isOpen: !!foundArg?.stopArg, parent: foundArg?.parent, currentArg: foundArg?.stopArg }
    }
  }

  return {
    suggestions: getCommandSuggestions(foundArg, allArgs, range),
    helpWidgetData: { isOpen: false }
  }
}

export const isIndexComplete = (index: string) => {
  if (index.length === 0) return false

  const firstChar = index[0]
  const lastChar = index[index.length - 1]

  if (firstChar !== '"' && firstChar !== "'") return true
  if (index.length === 1 && (firstChar === '"' || firstChar === "'")) return false
  if (firstChar !== lastChar) return false

  let escape = false
  for (let i = 1; i < index.length - 1; i++) {
    escape = index[i] === '\\' && !escape
  }

  return !escape
}
