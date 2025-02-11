'use client'

import React, { useState } from 'react'

import { useRouter } from 'next/navigation'

import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import {
  Box,
  Grid,
  Typography,
  Chip,
  Avatar,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import MessageIcon from '@mui/icons-material/Message'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'

import IconButton from '@mui/material/IconButton'
import VisibilityIcon from '@mui/icons-material/Visibility'

import SearchIcon from '@mui/icons-material/Search'

// Define Task interface
interface Task {
  id: string
  title: string
  dueDate: string
  attachments: number
  messages: number
  avatars: number
  chips: string[]
}

// Define TaskCards type
type TaskCards = {
  [key: string]: Task[]
}

const initialTasks: TaskCards = {
  pending: [
    {
      id: '1',
      title: 'Research FAQ page UX',
      dueDate: '16 March, 2024',
      attachments: 4,
      messages: 2,
      avatars: 2,
      chips: ['UX']
    },
    {
      id: '2',
      title: 'Design new onboarding flow',
      dueDate: '20 March, 2024',
      attachments: 1,
      messages: 1,
      avatars: 1,
      chips: ['App']
    }
  ],
  completed: [
    {
      id: '3',
      title: 'Finalize project report',
      dueDate: '10 March, 2024',
      attachments: 3,
      messages: 0,
      avatars: 1,
      chips: ['Dashboard']
    },
    {
      id: '4',
      title: 'Update style guide',
      dueDate: '12 March, 2024',
      attachments: 2,
      messages: 1,
      avatars: 2,
      chips: ['UX']
    }
  ],
  inProgress: [
    {
      id: '5',
      title: 'Develop new feature',
      dueDate: '25 March, 2024',
      attachments: 5,
      messages: 3,
      avatars: 2,
      chips: ['App', 'Deadline']
    },
    {
      id: '6',
      title: 'Test application performance',
      dueDate: '30 March, 2024',
      attachments: 2,
      messages: 1,
      avatars: 1,
      chips: ['UX']
    }
  ],
  overdue: [
    {
      id: '7',
      title: 'Fix bugs in production',
      dueDate: '05 March, 2024',
      attachments: 1,
      messages: 0,
      avatars: 1,
      chips: ['App']
    }
  ]
}

// TaskCard Props Interface
interface TaskCardProps {
  task: Task
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: task.id })

  return (
    <Box>
      <Box
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        sx={{
          cursor: 'grab',
          display: 'flex',
          flexDirection: 'column',
          rowGap: 2,
          borderRadius: '8px',
          padding: '10px',
          marginTop: '10px',
          backgroundColor: 'white',
          boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ display: 'flex', columnGap: 1 }}>
          {task.chips.map((chip, index) => (
            <Chip
              key={index}
              label={chip}
              sx={{
                backgroundColor: chip === 'UX' ? '#28c76f29' : chip === 'App' ? '#7367f029' : '#b3261e29',
                color: chip === 'UX' ? '#28C76F' : chip === 'App' ? '#7367F0' : '#FF3B30'
              }}
            />
          ))}
        </Box>
        <Typography sx={{ fontSize: 14 }}>{task.title}</Typography>
        <Typography sx={{ fontSize: 10 }}>Due Date: {task.dueDate}</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', columnGap: 2 }}>
            <AttachFileIcon />
            <span>{task.attachments}</span>
            <MessageIcon />
            <span>{task.messages}</span>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', marginLeft: '5px' }}>
            {[...Array(task.avatars)].map((_, i) => (
              <Avatar key={i} sx={{ width: 20, height: 20, marginTop: '-5px' }} />
            ))}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <EditIcon sx={{ color: '#28C76F' }} />
          <DeleteIcon sx={{ color: '#FF3B30' }} />
        </Box>
      </Box>
    </Box>
  )
}

// TaskColumn Props Interface
interface TaskColumnProps {
  category: string
  tasks: Task[]
  handleOpenModal: () => void
}

const TaskColumn: React.FC<TaskColumnProps> = ({ category, tasks, handleOpenModal }) => {
  const { setNodeRef } = useDroppable({ id: category })

  return (
    <Grid item xs={12} md={3} p={3} ref={setNodeRef}>
      <Box sx={{ paddingBottom: '10px', marginBottom: '10px' }}>
        <Typography sx={{ fontWeight: 'bold' }}>{category.charAt(0).toUpperCase() + category.slice(1)}</Typography>
        <Typography sx={{ fontSize: '12px', color: '#666' }}>{tasks.length} Tasks</Typography>
        <Typography sx={styles.addTask} onClick={handleOpenModal}>
          + Add New Task
        </Typography>
      </Box>

      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </Grid>
  )
}

const Tasks: React.FC = () => {
  const [taskCards, setTaskCards] = useState<TaskCards>(initialTasks)

  const router = useRouter()

  const [openModal, setOpenModal] = useState(false)

  const [view, setView] = useState<'board' | 'list'>('board')

  const [newTask, setNewTask] = useState({
    title: '',
    dueDate: '',
    attachments: 0,
    messages: 0,
    avatars: 0,
    chips: []
  })

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return // If not dropped on a valid target, do nothing

    const sourceCategory = Object.keys(taskCards).find(key => taskCards[key].some(task => task.id === active.id))
    const destinationCategory = over.id.toString()

    if (!sourceCategory || !destinationCategory || sourceCategory === destinationCategory) return

    const taskToMove = taskCards[sourceCategory].find(task => task.id === active.id)

    if (!taskToMove) return

    setTaskCards(prev => ({
      ...prev,
      [sourceCategory]: prev[sourceCategory].filter(task => task.id !== active.id),
      [destinationCategory]: [...prev[destinationCategory], taskToMove]
    }))
  }

  const handleOpenModal = () => {
    setOpenModal(true)
  }

  const handleView = (task: any) => {
    router.push(`/tasks/${task.title}`)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target

    setNewTask({ ...newTask, [name]: value })
  }

  const handleSubmit = () => {
    // Logic to add the new task goes here
    console.log(newTask)
    handleCloseModal()
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <Box sx={styles.stickyHeader}>
        <Box sx={{ ...styles.headerContainer }}>
          <Box sx={{ ...styles.headerContainer, columnGap: 6 }}>
            <Typography variant='h6' sx={styles.title}>
              Tasks
            </Typography>
            <Box sx={{ display: 'flex', borderRadius: '10px', overflow: 'hidden', border: '1px solid #633CB8' }}>
              <Button
                variant='contained'
                sx={{
                  padding: '10px 16px',
                  backgroundColor: view === 'board' ? '#633CB8' : 'white',
                  color: view === 'board' ? 'white' : '#633CB8',
                  borderRadius: view === 'board' ? '9px 0 0 9px' : 0,
                  border: 'none',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: '#aca2c0',
                    color: 'white'
                  }
                }}
                onClick={() => setView('board')}
              >
                Board
              </Button>
              <Button
                variant='contained'
                sx={{
                  padding: '10px 16px',
                  backgroundColor: view === 'list' ? '#633CB8' : 'white',
                  color: view === 'list' ? 'white' : '#633CB8',
                  borderRadius: view === 'list' ? '0 9px 9px 0' : 0,
                  border: 'none',
                  flex: 1,
                  '&:hover': {
                    backgroundColor: '#aca2c0',
                    color: 'white'
                  }
                }}
                onClick={() => setView('list')}
              >
                List
              </Button>
            </Box>
          </Box>
          <Box sx={{ ...styles.headerContainer, columnGap: 2 }}>
            <TextField
              variant='outlined'
              placeholder='Search'
              InputProps={{
                startAdornment: <SearchIcon />
              }}
              sx={styles.searchField}
            />
          </Box>
        </Box>
      </Box>
      {view === 'board' ? (
        <Box sx={{ padding: '20px' }}>
          <Grid container spacing={6}>
            {Object.keys(taskCards).map(key => (
              <TaskColumn key={key} category={key} tasks={taskCards[key]} handleOpenModal={handleOpenModal} />
            ))}
          </Grid>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', padding: '20px' }}>
            <TextField
              select
              label='Department'
              variant='outlined'
              placeholder='Select Department'
              sx={{ marginRight: 2, minWidth: '150px' }}
            >
              <MenuItem value='department1'>Department 1</MenuItem>
              <MenuItem value='department2'>Department 2</MenuItem>
            </TextField>
            <TextField
              select
              label='Project'
              variant='outlined'
              placeholder='Select Project'
              sx={{ marginRight: 2, minWidth: '150px' }}
            >
              <MenuItem value='project1'>Project 1</MenuItem>
              <MenuItem value='project2'>Project 2</MenuItem>
            </TextField>
            <TextField
              select
              label='Status'
              variant='outlined'
              placeholder='Select Status'
              sx={{ marginRight: 2, minWidth: '150px' }}
            >
              <MenuItem value='status1'>Status 1</MenuItem>
              <MenuItem value='status2'>Status 2</MenuItem>
            </TextField>
            <TextField
              type='date'
              variant='outlined'
              sx={{ marginRight: 2, minWidth: '150px' }}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ mt: 3, overflowX: 'auto', backgroundColor: 'white' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>TASK</TableCell>
                  <TableCell>LABEL</TableCell>
                  <TableCell>DUE DATE</TableCell>
                  <TableCell>ASSIGNED TO</TableCell>
                  <TableCell>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.values(taskCards)
                  .flat()
                  .map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {task.chips.map((chip, chipIndex) => (
                            <Chip
                              key={chipIndex}
                              label={chip}
                              sx={{
                                backgroundColor:
                                  chip === 'UX'
                                    ? '#28c76f29'
                                    : chip === 'App'
                                      ? '#7367f029'
                                      : chip === 'Dashboard'
                                        ? '#00bad129'
                                        : '#b3261e29',
                                color:
                                  chip === 'UX'
                                    ? '#28C76F'
                                    : chip === 'App'
                                      ? '#7367F0'
                                      : chip === 'Dashboard'
                                        ? '#00BAD1'
                                        : '#FF3B30'
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {[...Array(task.avatars)].map((_, i) => (
                            <Avatar key={i} sx={{ width: 30, height: 30, marginLeft: i > 0 ? '-5px' : 0 }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleView(task)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton onClick={() => console.log('Edit Task', task.title)}>
                          <EditIcon sx={{ color: '#52B13F' }} />
                        </IconButton>
                        <IconButton onClick={() => console.log('Delete Task', task.title)}>
                          <DeleteIcon sx={{ color: '#FF3B30' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography sx={styles.addTask} onClick={handleOpenModal}>
                      + Add New Task
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <label>Task Title</label>
          <TextField
            autoFocus
            margin='dense'
            name='title'
            type='text'
            fullWidth
            variant='outlined'
            onChange={handleInputChange}
          />
          <label>Due Date</label>
          <TextField
            margin='dense'
            name='dueDate'
            type='date'
            fullWidth
            variant='outlined'
            onChange={handleInputChange}
          />
          <label>Attachments</label>
          <TextField
            margin='dense'
            name='attachments'
            type='number'
            fullWidth
            variant='outlined'
            onChange={handleInputChange}
          />
          <label>Messages</label>
          <TextField
            margin='dense'
            name='messages'
            type='number'
            fullWidth
            variant='outlined'
            onChange={handleInputChange}
          />
          <label>Avatars</label>
          <TextField
            margin='dense'
            name='avatars'
            type='number'
            fullWidth
            variant='outlined'
            onChange={handleInputChange}
          />
          <label>Chips</label>
          <TextField
            margin='dense'
            name='chips'
            label='Chips (comma separated)'
            type='text'
            fullWidth
            variant='outlined'
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color='primary'>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  )
}

export default Tasks

const styles = {
  stickyHeader: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 1,
    boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
    padding: '16px'
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: { xs: 'column', sm: 'row' }
  },
  title: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#2F2F2F'
  },
  searchField: {
    maxWidth: '400px',
    display: { xs: 'none', md: 'flex' }
  },
  cell: {
    color: '#633CB8'
  },
  boardContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px'
  },
  taskTitle: {
    variant: 'h5',
    color: '#2F2B3D',
    fontWeight: 500
  },
  taskCount: {
    fontSize: '12px',
    marginBottom: '8px'
  },
  addTask: {
    fontSize: '14px',
    marginTop: '3px',
    color: '#633CB8',
    cursor: 'pointer'
  }
}
