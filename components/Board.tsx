'use client'

import { useEffect } from 'react'
import { DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd'
import { useBoardStore } from '@/store/BoardStore'
import Column from './Column'

function Board() {
  const [board, getBoard, setBoardState] = useBoardStore((state) => [
    state.board,
    state.getBoard,
    state.setBoardState
  ])

  useEffect(() => {
    getBoard()
  }, [getBoard])

  const handleOnDragEnd = (result: DropResult) => {
    // destination: 要拖曳到的目的地位置
    // source: 當下拖曳的位置
    const { destination, source, type } = result
    if (!destination) return

    // handle column drag
    if (type === 'column') {
      const entries = Array.from(board.columns.entries())
      const [removed] = entries.splice(source.index, 1)
      entries.splice(destination.index, 0, removed)
      const rearrangedColumns = new Map(entries)
      setBoardState({ ...board, columns: rearrangedColumns })
      return
    }

    // handle todo item drag
    const columns = Array.from(board.columns)
    const startColIndex = columns[Number(source.droppableId)]
    const finishColIndex = columns[Number(destination.droppableId)]

    const startCol: Column = {
      id: startColIndex[0],
      todos: startColIndex[1].todos
    }

    const finishCol: Column = {
      id: finishColIndex[0],
      todos: finishColIndex[1].todos
    }

    if (!startCol || !finishCol) return
    if (source.index === destination.index && startCol === finishCol) {
      return
    }

    const newTodos = startCol.todos
    // 將當前拖曳 todo 取出
    const [todoMoved] = newTodos.splice(source.index, 1)

    if (startCol.id === finishCol.id) {
      // Same column task drag
      // 將當前拖曳的 todo 放到目標位置
      newTodos.splice(destination.index, 0, todoMoved)

      const newCol = {
        id: startCol.id,
        todos: newTodos
      }

      const newColumns = new Map(board.columns)
      newColumns.set(startCol.id, newCol)

      // update to store
      setBoardState({ ...board, columns: newColumns })
    } else {
      // dragging to another column
      const finishTodos = Array.from(finishCol.todos)
      // 將當前拖曳的 todo 放到新的位置
      finishTodos.splice(destination.index, 0, todoMoved)

      const newColumns = new Map(board.columns)
      const newCol = {
        id: startCol.id,
        todos: newTodos
      }

      // 將已經刪除當前拖曳的 todo 資料更新到 startCol
      newColumns.set(startCol.id, newCol)

      // 將已經把拖曳資料更新到目的地的資料更新到 finishCol
      newColumns.set(finishCol.id, {
        id: finishCol.id,
        todos: finishTodos
      })

      // update to store
      setBoardState({ ...board, columns: newColumns })
    }
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} todos={column.todos} index={index} />
            ))}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default Board
