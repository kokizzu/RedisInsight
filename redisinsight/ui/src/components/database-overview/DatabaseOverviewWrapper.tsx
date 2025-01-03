import React, { useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DatabaseOverview } from 'uiSrc/components'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction
} from 'uiSrc/slices/instances/instances'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { getConfig } from 'uiSrc/config'
import { getOverviewMetrics } from './components/OverviewMetrics'

const riConfig = getConfig()

const TIMEOUT_TO_GET_INFO = riConfig.app.env !== 'development' ? riConfig.database.defaultTimeoutToGetInfo : 60_000

const DatabaseOverviewWrapper = () => {
  let interval: NodeJS.Timeout
  const { theme } = useContext(ThemeContext)
  const { id: connectedInstanceId = '', db } = useSelector(connectedInstanceSelector)
  const overview = useSelector(connectedInstanceOverviewSelector)

  const dispatch = useDispatch()

  useEffect(() => {
    interval = setInterval(() => {
      if (document.hidden) return

      dispatch(getDatabaseConfigInfoAction(
        connectedInstanceId,
        () => {},
        () => clearInterval(interval)
      ))
    }, TIMEOUT_TO_GET_INFO)
    return () => clearInterval(interval)
  }, [connectedInstanceId])

  return (
    <DatabaseOverview
      metrics={getOverviewMetrics({ theme, items: overview, db })}
    />
  )
}

export default DatabaseOverviewWrapper
