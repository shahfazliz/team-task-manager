import { ActionFunction, json } from '@remix-run/node';
import { addTopic as addTaskIntoTopic, eraseTopic as eraseTaskFromTopic, readAll as readAllTasks } from '~/resource/Tasks';
import { BasicNavLink as NavLink } from '~/ui-components/BasicNavLink';
import { Form, useLoaderData } from '@remix-run/react';
import { getUserSession } from '~/session';
import { readAll as readAllTopics } from '~/resource/Topics';
import { sanitizeData } from '~/sanitizerForm';
import { TaskStatusType } from '~/model/TaskStatus';
import { TopicType } from '~/model/Topic';
import { UserType } from '~/model/User';
import Chip from '~/ui-components/Chip';
import LabelSelect from '~/ui-components/LabelSelect';
import type { LoaderArgs, LoaderFunction, MetaFunction } from '@remix-run/node';

const ACTION_ADD_TOPIC = 'add-topic';
const ACTION_REMOVE_TOPIC = 'remove-topic';

type DataPropType = {
  id: number,
  name: string,
  description: string,
  assignedTo: UserType,
  taskStatus: TaskStatusType,
  isImportant: boolean,
  isUrgent: boolean,
  timeEstimate: number,
  createdBy: UserType,
  updatedBy: UserType,
  createdAt: string,
  updatedAt: string,
  topics: TopicType[],
}

type RowPropType = {
  tasks: DataPropType[];
  allTopics: TopicType[];
}

export default function AllTasks() {
  const { tasks, allTopics } = useLoaderData<typeof loader>();

  return (<>
    <hgroup>
      <h1>Tasks</h1>
      <h2>All Tasks</h2>
    </hgroup>
    <Rows tasks={tasks} allTopics={allTopics}/>
    <NavLink role='button' to='./create'>create</NavLink>
  </>);
}

const TopicChips = ({topics, taskId}:{topics:TopicType[], taskId:number}) => {
  return (<>
    {
      topics.length === 0
        ? 'there is no topic associated to this task'
        : topics.map((topic) => {
          return ( 
            <Chip
              key={topic.id}
              actionName={ACTION_REMOVE_TOPIC}
              data={{topicId: topic.id, taskId}}
            >
              {topic.name}
            </Chip>
          );
        })
    }
  </>);
};

const TopicSelectOptions = ({taskId, allTopics}:{taskId:number, allTopics:TopicType[]}) => {
  return (
    <Form method='post'>
      <input type='hidden' name='taskId' value={taskId} />
      <LabelSelect name={ACTION_ADD_TOPIC} options={allTopics} />
      <button
        type='submit'
        name='_action'
        value={ACTION_ADD_TOPIC}
        aria-label={ACTION_ADD_TOPIC}
      >
        add
      </button>
    </Form>
  );
}

const Task = ({task, allTopics, index}: {task:DataPropType, allTopics:TopicType[], index:number}) => {
  return (
    <details>
      <summary>
        <span className='task-row'>
          <div>{index + 1}. </div>
          <div>{task.name} </div>
          <div className='summary-detail'>{task.assignedTo.name} </div>
          <div className='summary-detail'>{task.taskStatus.name}</div>
        </span>
        <NavLink to={`./update/${task.id}`}>update</NavLink>
        <NavLink to={`./delete/${task.id}`}>delete</NavLink>
      </summary>
      <ul>
        <li>Description: {task.description}</li>
        <li>Assigned to: {task.assignedTo.name}</li>
        <li>Task status: {task.taskStatus.name}</li>
        <li>Important: {task.isImportant ? 'High' : 'Low'}</li>
        <li>Urgent: {task.isUrgent ? 'High' : 'Low'}</li>
        <li>Time estimate: {task.timeEstimate} hour{task.timeEstimate > 1 && 's'}</li>
        <li>Created by: {task.createdBy.name} on {task.createdAt}</li>
        <li>Last updated by: {task.updatedBy.name} on {task.updatedAt}</li>
        <li>Projects: <TopicChips topics={task.topics} taskId={task.id}/></li>
      </ul>
      <TopicSelectOptions allTopics={allTopics} taskId={task.id}/>
    </details>
  );
}

const Rows = ({tasks, allTopics}:RowPropType) => {
  const urgentAndImportantTasks = tasks.filter(task => task.isUrgent && task.isImportant);
  const notUrgentAndImportantTasks = tasks.filter(task => !task.isUrgent && task.isImportant);
  const urgentAndNotImportantTasks = tasks.filter(task => task.isUrgent && !task.isImportant);
  const notUrgentAndNotImportantTasks = tasks.filter(task => !task.isUrgent && !task.isImportant);

  return (<table>
    <thead>
      <tr><th>&nbsp;</th><th>Urgent</th><th>Not Urgent</th></tr>
    </thead>
    <tbody>
      <tr>
        <th className='vertical-text'>Important</th>
        <td>
          {
            // Urgent and Important
            urgentAndImportantTasks.length > 0
              ? urgentAndImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
              : <div className='empty-task-container'>there is no task</div>
          }
        </td>
        <td>
          {
            // Not Urgent and Important
            notUrgentAndImportantTasks.length > 0
              ? notUrgentAndImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
              : <div className='empty-task-container'>there is no task</div>
          }
        </td>
      </tr>
      <tr>
        <th className='vertical-text'>Not Important</th>
        <td>
          {
            // Urgent and Not Important
            urgentAndNotImportantTasks.length > 0
              ? urgentAndNotImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
              : <div className='empty-task-container'>there is no task</div>
          }
        </td>
        <td>
          {
            // Not Urgent and Not Important
            notUrgentAndNotImportantTasks.length > 0
              ? notUrgentAndNotImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
              : <div className='empty-task-container'>there is no task</div>
          }
        </td>
      </tr>
    </tbody>
    </table>
  //   <div></div>
  //   <div>Urgent</div>
  //   <div>Not Urgent</div>
  //   <div className='vertical-text'>Important</div>
  //   {
  //     // Urgent and Important
  //     urgentAndImportantTasks.length > 0
  //       ? urgentAndImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
  //       : <div>there is no task</div>
  //   }
  //   {
  //     // Not Urgent and Important
  //     notUrgentAndImportantTasks.length > 0
  //       ? notUrgentAndImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
  //       : <div>there is no task</div>
  //   }
  //   <div className='vertical-text'>Not Important</div>
  //   {
  //     // Urgent and Not Important
  //     urgentAndNotImportantTasks.length > 0
  //       ? urgentAndNotImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
  //       : <div>there is no task</div>
  //   }
  //   {
  //     // Not Urgent and Not Important
  //     notUrgentAndNotImportantTasks.length > 0
  //       ? notUrgentAndNotImportantTasks.map((task: DataPropType, index:number) => <Task key={task.id} task={task} allTopics={allTopics} index={index}/>)
  //       : <div>there is no task</div>
  //   }
  // </div>
  );
};

export const loader:LoaderFunction = async({ params }:LoaderArgs) => {
  const tasks = await readAllTasks();
  const allTopics = await readAllTopics();
  return json({
    tasks,
    allTopics,
  });
}

export const action:ActionFunction = async({request}) => {
  const { user } = await getUserSession(request);
  const {_action, taskId, ...values} = sanitizeData({formData: await request.formData()});
  
  switch (_action) {
    case ACTION_ADD_TOPIC:
      await addTaskIntoTopic({
        createdByUserId: user.id,
        taskId,
        topicId: values[ACTION_ADD_TOPIC],
      });
      break;
    case ACTION_REMOVE_TOPIC: 
      await eraseTaskFromTopic({topicId: values.topicId, taskId});
      break;
    default:
      break;
  }

  return null;
};

export const meta:MetaFunction = () => {
  return {
    title: 'Tasks - Team Task Manager',
    description: 'Tasks page',
  };
};
