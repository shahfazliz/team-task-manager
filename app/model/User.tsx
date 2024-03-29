import {
  create as createUser, erase as eraseUser,
  search as searchUser, update as updateUser,
  searchOrganization as searchUserOrganization,
  searchRoles as searchUserRoles,
  searchProject as searchUserProject,
  searchTopic as searchUserTopic,
  searchTask as searchUserTask,
} from '~/resource/Users';
import { RoleType } from './Role';
import { OrganizationType } from './Organization';
import { TopicType } from './Topic';
import { TaskType } from './Task';

const TABLE_NAME = 'Users';

const TABLE_ATTRIBUTES = [
  'name',
  'email',
  'hashPassword',
];

type UserType = {
  id: number;
  name: string;
  email: string;
  hashPassword: string;
  getAttributeValues: () => [];
  create: () => UserType;
  udpate: () => UserType;
}

function User(obj:UserType) {
  return this.set(obj);
}

function getAttributeValues() {
  return TABLE_ATTRIBUTES.map((attribute) => this[attribute]);
}

function set(obj) {
  Object
    .keys(obj)
    .forEach((attribute) => this[attribute] = obj[attribute]);
  
  return this;
}

async function create() {
  try {
    await createUser(this);
  } catch(error) {
    console.error('createUser error:', error);    
  }
  return this;
}

async function search(criteriaObj:UserType) {
  try {
    return await searchUser(criteriaObj);
  } catch(error) {
    console.error('searchUser error:', error);
    return [];
  }
}

async function update() {
  try {
    await updateUser(this);
  } catch(error) {
    console.error('updateUser error:', error);
  }
  return this;
}

function roles():Promise<RoleType[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const roles = await searchUserRoles({userId: this.id});
      resolve(roles);
    } catch(error) {
      reject(error);
    }
  });
}

async function erase(criteriaObj) {
  try {
    await eraseUser(criteriaObj);
  } catch(error) {
    console.error('eraseUser error:', error);
  }
}

async function searchOrganization(criteriaObj:{userId:number}):Promise<OrganizationType[]> {
  try {
    return await searchUserOrganization(criteriaObj);
  } catch(error) {
    console.error('searchUserOrganization error:', error);
    return [];
  }
}

async function searchProject(criteriaObj:{userId:number}):Promise<OrganizationType[]> {
  try {
    return await searchUserProject(criteriaObj);
  } catch(error) {
    console.error('searchUserProject error:', error);
    return [];
  }
}

const searchTopic = async(criteriaObj:{userId:number}):Promise<TopicType[]> => {
  try {
    return await searchUserTopic(criteriaObj);
  } catch(error) {
    console.error('searchUserTopics error:', error);
    return [];
  }
}

const searchTask = async(criteriaObj:{userId:number}):Promise<TaskType[]> => {
  try {
    return await searchUserTask(criteriaObj);
  } catch(error) {
    console.error('searchUserTasks error:', error);
    return [];
  }
}

Object.assign(
  User.prototype,
  {
    getAttributeValues,
    set,
    create,
    update,
    roles,
  }
);

export {
  User,
  TABLE_NAME,
  TABLE_ATTRIBUTES,
  search,
  erase,
  searchOrganization,
  searchProject,
  searchTopic,
  searchTask,
};
export type { UserType };

