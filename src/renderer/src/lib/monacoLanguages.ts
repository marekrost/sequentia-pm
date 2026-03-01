import * as monaco from 'monaco-editor'

export function registerDbmlLanguage(): void {
  if (monaco.languages.getLanguages().some((lang) => lang.id === 'dbml')) return

  monaco.languages.register({ id: 'dbml' })

  monaco.languages.setMonarchTokensProvider('dbml', {
    keywords: ['Table', 'Ref', 'Enum', 'TableGroup', 'Project', 'Note', 'as'],
    typeKeywords: [
      'integer',
      'int',
      'varchar',
      'text',
      'boolean',
      'bool',
      'timestamp',
      'datetime',
      'float',
      'decimal',
      'bigint',
      'smallint',
      'serial',
      'json',
      'jsonb',
      'uuid',
      'date',
      'time',
      'blob'
    ],
    settingKeywords: ['pk', 'primary key', 'not null', 'null', 'unique', 'increment', 'default', 'ref', 'note'],
    brackets: [
      { open: '{', close: '}', token: 'delimiter.curly' },
      { open: '[', close: ']', token: 'delimiter.square' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' }
    ],
    tokenizer: {
      root: [
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              '@keywords': 'keyword',
              '@typeKeywords': 'type',
              '@default': 'identifier'
            }
          }
        ],
        [/"[^"]*"/, 'string'],
        [/'[^']*'/, 'string'],
        [/`[^`]*`/, 'string.backtick'],
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],
        [/[{}()\[\]]/, '@brackets'],
        [/[<>:\-]/, 'delimiter'],
        [/\d+/, 'number']
      ],
      comment: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment']
      ]
    }
  })
}
