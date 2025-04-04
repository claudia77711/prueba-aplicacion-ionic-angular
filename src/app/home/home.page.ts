import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

export interface Task {
  id: number;
  name: string;
  completed: boolean;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})


export class HomePage implements OnInit {

  tasks: Task[] = [];
  categories: Category[] = [];
  newTaskName: string = '';
  newCategoryName: string = '';
  selectedCategory: number = 0;


  constructor(private storage: Storage) {}
  ngOnInit() {
    this.storage.create();
    this.loadTasks();
    this.loadCategories();
  }

  async loadTasks() {
    const storedTasks = await this.storage.get('tasks');
    this.tasks = storedTasks || [];
  }

  async loadCategories() {
    const storedCategories = await this.storage.get('categories');
    this.categories = storedCategories || [];
  }

  async addTask() {
    if (this.newTaskName.trim() === '') return;

    const newTask: Task = {
      id: Date.now(),
      name: this.newTaskName,
      completed: false,
      categoryId: this.selectedCategory,
    };

    this.tasks.push(newTask);
    await this.storage.set('tasks', this.tasks);
    this.newTaskName = '';
  }

  async toggleTaskCompletion(task: Task) {
    task.completed = !task.completed;
    await this.storage.set('tasks', this.tasks);
  }

  async deleteTask(task: Task) {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    await this.storage.set('tasks', this.tasks);
  }

  async addCategory() {
    if (this.newCategoryName.trim() === '') return;

    const newCategory: Category = {
      id: Date.now(),
      name: this.newCategoryName,
    };

    this.categories.push(newCategory);
    await this.storage.set('categories', this.categories);
    this.newCategoryName = '';
  }

  async deleteCategory(category: Category) {
    this.categories = this.categories.filter(c => c.id !== category.id);
    this.tasks = this.tasks.filter(t => t.categoryId !== category.id); // Eliminar tareas asociadas
    await this.storage.set('tasks', this.tasks);
    await this.storage.set('categories', this.categories);
  }

  filterTasksByCategory(categoryId: number) {
    return categoryId === 0 ? this.tasks : this.tasks.filter(task => task.categoryId === categoryId);
  }
}
