"use client";

import { useMemo, useState } from 'react';
import { Pencil, Trash2, Clock, Flame, CheckCircle2, MoreVertical, TrendingUp } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const colStyles = {
  Pending: "border-secondary border-opacity-25 bg-secondary bg-opacity-5 text-muted",
  "In Progress": "border-primary border-opacity-50 bg-primary bg-opacity-5 text-primary shadow-lg",
  Completed: "border-success border-opacity-50 bg-success bg-opacity-5 text-success",
  Overdue: "border-danger border-opacity-50 bg-danger bg-opacity-10 text-danger"
};

const badgeStyles = {
  Low: "bg-success bg-opacity-10 text-success border-success border-opacity-25",
  Medium: "bg-warning bg-opacity-10 text-warning border-warning border-opacity-25",
  High: "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25"
};

function SortableItem(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: props.id});
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const task = props.task;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-3 mb-3 glass-panel border border-secondary border-opacity-25 position-relative group cursor-grab">
      <div className="position-absolute top-0 start-0 h-100 rounded-start bg-primary opacity-75" style={{ width: 4 }}></div>
      
      <div className="d-flex justify-content-between align-items-start mb-2">
         <h6 className="fw-bold mb-0 text-white pe-4" style={{ fontSize: 13 }}>{task.title}</h6>
         <button className="btn btn-link text-muted p-0 border-0 opacity-0 group-hover:opacity-100 transition-all"><MoreVertical size={14} /></button>
      </div>

      <div className="text-light-muted small mb-3 truncate" style={{ fontSize: 11 }}>{task.description || "No description provided."}</div>

      <div className="d-flex align-items-center justify-content-between mt-auto">
         <span className={`badge ${badgeStyles[task.priority] || badgeStyles.Medium} border tracking-widest text-uppercase`} style={{ fontSize: 9 }}>
            {task.priority || "Medium"}
         </span>
         <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: 10 }}>
            <div className="d-flex align-items-center gap-1">
               <Clock size={10} />
               <span>Due {task.due || "TBD"}</span>
            </div>
            {task.totalHours > 0 && (
               <div className="d-flex align-items-center gap-1 text-primary">
                  <TrendingUp size={10} />
                  <span>Spent {task.totalHours}h</span>
               </div>
            )}
         </div>
      </div>

            {/* Subtasks Progress */}
            {task.subtasks?.total > 0 && (
               <div className="d-flex align-items-center gap-2 mt-3 text-muted" style={{ fontSize: 10 }}>
                  <CheckCircle2 size={12} className={task.subtasks.completed === task.subtasks.total ? 'text-success' : 'text-primary'} />
                  <span className="fw-bold tracking-widest text-uppercase">{task.subtasks.completed} / {task.subtasks.total} CHECKLIST ITEMS</span>
               </div>
            )}

      <div className="d-flex gap-2 mt-4 pt-2 border-top border-secondary border-opacity-10 opacity-0 group-hover:opacity-100 transition-all">
         <button className="btn btn-sm btn-dark bg-opacity-50 p-1 px-2 border-secondary border-opacity-25 text-info" onClick={() => props.onEdit(task.id)}><Pencil size={12} /></button>
         <button className="btn btn-sm btn-dark bg-opacity-50 p-1 px-2 border-secondary border-opacity-25 text-danger" onClick={() => props.onDelete(task.id)}><Trash2 size={12} /></button>
         <button className="btn btn-sm btn-dark bg-opacity-50 p-1 px-2 border-secondary border-opacity-25 text-primary ms-auto" onClick={() => props.onLogTime(task.id)}><Clock size={12} /></button>
      </div>
    </div>
  );
}

function DroppableCol({ colId, tasks, onDelete, onEdit, onLogTime }) {
  const { setNodeRef } = useDroppable({ id: colId });
  const colTasksIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const getColumnTitle = (status) => {
    switch (status) {
      case 'In Progress':
        return 'IN PROGRESS';
      case 'Completed':
        return 'COMPLETED';
      case 'Pending':
        return 'PENDING';
      case 'In Review':
        return 'IN REVIEW';
      default:
        return 'OVERDUE';
    }
  };

  return (
    <div className={`col-12 col-xl-3 mb-4`}>
       <div className={`p-4 h-100 flex-grow-1 border-top border-3 rounded-4 glass-panel ${colStyles[colId]}`}>
          <div className="d-flex justify-content-between align-items-center mb-4">
             <h6 className="fw-black text-uppercase tracking-widest mb-0" style={{ fontSize: 11 }}>{getColumnTitle(colId)}</h6>
             <span className="badge bg-dark rounded-pill border border-secondary border-opacity-25 px-2" style={{ fontSize: 10, color: '#64748b' }}>{tasks.length}</span>
          </div>

          <div ref={setNodeRef} className="pb-5 min-h-200" style={{ minHeight: '400px' }}>
            <SortableContext items={colTasksIds} strategy={verticalListSortingStrategy}>
              {tasks.length > 0 ? (
                tasks.map((task) => <SortableItem key={task.id} id={task.id} task={task} onDelete={onDelete} onEdit={onEdit} onLogTime={onLogTime} />)
              ) : (
                 <div className="d-flex flex-column align-items-center justify-content-center py-5 opacity-25">
                    <CheckCircle2 size={32} />
                    <span className="small mt-2 font-bold uppercase tracking-widest" style={{ fontSize: 9 }}>Clear</span>
                 </div>
              )}
            </SortableContext>
          </div>
       </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, setTasks, onDelete, onEdit, onLogTime }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const columnsArr = ['Pending', 'In Progress', 'Completed', 'Overdue'];
    const reverseStatusMap = { 'Pending': 1, 'In Progress': 2, 'Completed': 3, 'Overdue': 4 };

    if (columnsArr.includes(overId)) {
      if (activeTask.status !== overId) {
        setTasks((prev) => prev.map(t => t.id === activeId ? { ...t, status: overId } : t));
        fetch(`http://127.0.0.1:5129/api/tasks/${activeId}/status`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reverseStatusMap[overId])
        }).catch(err => console.error(err));
      }
      return;
    }

    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;
    
    if (activeTask.status !== overTask.status) {
      setTasks((prev) => prev.map(t => t.id === activeId ? { ...t, status: overTask.status } : t));
      fetch(`http://127.0.0.1:5129/api/tasks/${activeId}/status`, {
          method: 'PATCH',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reverseStatusMap[overTask.status])
      }).catch(err => console.error(err));
      return;
    }

    if (activeId !== overId) {
      setTasks((prev) => {
        const oldIndex = prev.findIndex((t) => t.id === activeId);
        const newIndex = prev.findIndex((t) => t.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const columnsArr = ['Pending', 'In Progress', 'Completed', 'Overdue'];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
       <div className="row g-4 mt-1 flex-nowrap overflow-x-auto pb-4" style={{ minHeight: '600px' }}>
          {columnsArr.map(col => (
             <DroppableCol key={col} colId={col} tasks={tasks.filter((t) => t.status === col)} onDelete={onDelete} onEdit={onEdit} onLogTime={onLogTime} />
          ))}
       </div>
    </DndContext>
  );
}
