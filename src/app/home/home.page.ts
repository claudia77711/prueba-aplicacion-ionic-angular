import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { AngularFireRemoteConfig } from '@angular/fire/compat/remote-config';
import { environment } from 'src/environments/environment';

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
  showNewFeature: boolean = true;
  newCategoryName: string = '';
  selectedCategory: number = 0;


  constructor(
    private storage: Storage,
    private remoteConfig: AngularFireRemoteConfig
  ) {}
  ngOnInit() {
    this.storage.create();
    this.loadTasks();
    this.loadCategories();
    this.fetchFeatureFlag();
  }

  async loadTasks() {
    const storedTasks = await this.storage.get('tasks');
    this.tasks = storedTasks || [];
  }

  // Obtener el Feature Flag de Remote Config
  async fetchFeatureFlag() {
    try {
      // Fetch y activar la configuración remota de Firebase
      await this.remoteConfig.fetchAndActivate();
       // Obtener el valor de la configuración remota 'show_new_feature'
    const configValue = await this.remoteConfig.getValue('show_new_feature');
    // Convertir el valor a booleano
    const showNewFeatureFlag = configValue.asBoolean();
      console.log('NEWFEATUREFLAG', showNewFeatureFlag);
       // Actualizamos la variable para controlar la UI
      this.showNewFeature = true;
      console.log('FLAG', this.showNewFeature);
    } catch(error) {
      console.error('Error al obtener el Feature Flag:', error);
    };
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
