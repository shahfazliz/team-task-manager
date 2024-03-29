import { getUserSession } from '~/session';
import { json, redirect } from '@remix-run/node';
import { readAll as readAllTaskStatus } from '~/resource/TaskStatus';
import { sanitizeData } from '~/sanitizerForm';
import { search as searchTask } from '~/model/Task';
import { search as searchTaskStatus } from '~/model/TaskStatus';
import { search as searchUser } from '~/model/User';
import { useLoaderData, useTransition as useNavigation } from '@remix-run/react';
import TaskForm from '~/ui-components/TaskForm';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { searchProject as searchUserProject } from '~/model/User';

export default function UpdateTask() {
  const { users, taskStatuses, task } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (<>
    <hgroup>
      <h1>Tasks</h1>
      <h2>Update Task</h2>
    </hgroup>
    <TaskForm {...task} users={users} taskStatuses={taskStatuses} isSubmitting={isSubmitting} />
  </>);
}

export const loader:LoaderFunction = async({request, params}) => {
  const { user } = await getUserSession(request);
  const userProject = await searchUserProject({userId: user.id});
  const allUsers = userProject.reduce((accumulator, project) => {
    return [...accumulator, ...project.users];
  }, [user]);
  const uniqueUsers = Object.values(allUsers.reduce((accumulator, user) => {
    return {
      ...accumulator,
      [user.id]: user,
    };
  }, {}));
  const taskStatuses = await readAllTaskStatus();
  const objs = await searchTask({id: params.id});
  return json({
    users: uniqueUsers,
    taskStatuses,
    task: objs[0],
  });
}

export const action:ActionFunction = async({request, params}) => {
  const { user } = await getUserSession(request);
  const {
    name,
    description,
    status,
    importance,
    urgency,
    ...values
  } = sanitizeData({formData: await request.formData()});
  const searchedUsers = await searchUser({id: values['assign-to']});
  const taskStatuses = await searchTaskStatus({id: status});

  const objs = await searchTask({id: params.id});
  objs[0]
    .set({
      name,
      description,
      timeEstimate: values['time-estimate'],
      assignedTo: searchedUsers[0],
      taskStatus: taskStatuses[0],
      isImportant: importance,
      isUrgent: urgency,
      createdBy: user,
      updatedBy: user,
    })
    .update();

  return redirect('/tasks')
}
