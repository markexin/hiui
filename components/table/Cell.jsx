import React, { useContext, useState } from 'react'
import classNames from 'classnames'
import TableContext from './context'
import Icon from '../icon'
import Indent from './Indent'
import IconLoading from './LoadingIcon'

const Cell = ({
  column,
  allRowData,
  columnIndex,
  level,
  showColHighlight,
  hoverColIndex,
  setHoverColIndex,
  expandedTree,
  expandedTreeRows,
  setExpandedTreeRows,
  rowIndex,
  isTree
}) => {
  const { highlightedColKeys, highlightColumns, alignRightColumns, prefix, onLoadChildren, loadChildren } = useContext(
    TableContext
  )
  const [loading, setLoading] = useState(false)
  // 处理自定义 render 或者合并单元格情况
  const cellContent = column.render
    ? column.render(allRowData[column.dataKey], allRowData, rowIndex)
    : allRowData[column.dataKey]
  const isMergeCell = cellContent && typeof cellContent === 'object' && !cellContent.$$typeof
  if (isMergeCell && (cellContent.props.colSpan === 0 || cellContent.props.rowSpan === 0)) {
    return null
  }
  return (
    <td
      key={column.dataKey}
      style={{
        textAlign: alignRightColumns.includes(column.dataKey) ? 'right' : 'left'
      }}
      colSpan={(isMergeCell && cellContent.props.colSpan) || ''}
      rowSpan={(isMergeCell && cellContent.props.rowSpan) || ''}
      className={classNames({
        [`${prefix}__col--highlight`]:
          highlightedColKeys.includes(column.dataKey) || highlightColumns.includes(column.dataKey),
        [`${prefix}__col__hover--highlight`]: showColHighlight && hoverColIndex === column.dataKey
      })}
      onMouseEnter={(e) => showColHighlight && setHoverColIndex(column.dataKey)}
      onMouseLeave={(e) => showColHighlight && setHoverColIndex(null)}
    >
      {level > 1 && columnIndex === 0 && <Indent times={level - 1} />}
      {/* 在异步加载子节点的时候，通过 isLeaf 进行判断 */}
      {loading && <IconLoading />}
      {columnIndex === 0 &&
        !loading &&
        ((allRowData.children && allRowData.children.length > 0) || (onLoadChildren && allRowData.isLeaf) ? (
          <Icon
            style={{ marginRight: 4, cursor: 'pointer' }}
            name={expandedTree ? 'caret-down' : 'caret-right'}
            onClick={async () => {
              // 存在即收起，并删除该key
              const _expandedTreeRows = [...expandedTreeRows]
              if (onLoadChildren) {
                const data = onLoadChildren(allRowData)
                if (data.toString() === '[object Promise]') {
                  setLoading(true)
                  await data
                    .then((res) => {
                      loadChildren.current = res
                      setLoading(false)
                    })
                    .catch(() => {
                      loadChildren.current = null
                      setLoading(false)
                    })
                } else {
                  loadChildren.current = data
                }
              }
              if (_expandedTreeRows.includes(allRowData.key)) {
                const idx = _expandedTreeRows.findIndex((row) => row === allRowData.key)
                _expandedTreeRows.splice(idx, 1)
                setExpandedTreeRows(_expandedTreeRows)
              } else {
                _expandedTreeRows.push(allRowData.key)
                setExpandedTreeRows(_expandedTreeRows)
              }
            }}
          />
        ) : (
          isTree && <span style={{ width: 18, display: 'inline-block' }} key={Math.random()} />
        ))}

      {(isMergeCell && cellContent.children) || cellContent}
    </td>
  )
}

export default Cell
