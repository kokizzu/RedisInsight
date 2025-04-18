import { fireEvent } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import React from 'react'
import { setWorkbenchCleanUp } from 'uiSrc/slices/user/user-settings'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'

import WorkbenchSettings from './WorkbenchSettings'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('WorkbenchSettings', () => {
  it('should render', () => {
    expect(render(<WorkbenchSettings />)).toBeTruthy()
  })

  it('should call proper actions after click on switch wb clear mode', () => {
    render(<WorkbenchSettings />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('switch-workbench-cleanup'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setWorkbenchCleanUp(false),
    ])
  })

  it('should pipeline-bunch render ', () => {
    render(<WorkbenchSettings />)

    expect(screen.getByTestId(/pipeline-bunch/)).toBeInTheDocument()
  })
})
