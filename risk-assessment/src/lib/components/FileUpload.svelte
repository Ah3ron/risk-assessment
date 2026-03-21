<script lang="ts">
  import { parseCSVFile, generateDemoData, validateData } from '$lib/parser';
  import type { IncidentData } from '$lib/types';

  interface Props {
    onDataLoaded: (data: IncidentData[]) => void;
  }

  let { onDataLoaded }: Props = $props();

  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let fileName = $state<string | null>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      error = 'Пожалуйста, загрузите файл в формате CSV';
      return;
    }

    isLoading = true;
    error = null;

    try {
      const data = await parseCSVFile(file);
      const validation = validateData(data);

      if (!validation.valid) {
        error = validation.errors.join('\n');
        isLoading = false;
        return;
      }

      fileName = file.name;
      onDataLoaded(data);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Неизвестная ошибка при обработке файла';
    } finally {
      isLoading = false;
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) handleFile(file);
  }

  function loadDemoData() {
    const data = generateDemoData();
    fileName = 'Демонстрационные данные';
    onDataLoaded(data);
  }
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      Загрузка данных
    </h2>

    <!-- Зона перетаскивания -->
    <div
      class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all {isDragging ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary hover:bg-base-200'}"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={() => fileInput?.click()}
      onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
      role="button"
      tabindex="0"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="font-medium mb-1">Перетащите CSV файл сюда</p>
      <p class="text-sm text-base-content/60">или нажмите для выбора</p>
      <input type="file" accept=".csv" bind:this={fileInput} onchange={handleInputChange} class="hidden" />
    </div>

    <!-- Ошибка -->
    {#if error}
      <div class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span class="whitespace-pre-line text-sm">{error}</span>
      </div>
    {/if}

    <!-- Загрузка -->
    {#if isLoading}
      <div class="flex items-center justify-center gap-2">
        <span class="loading loading-spinner loading-md text-primary"></span>
        <span>Обработка...</span>
      </div>
    {/if}

    <!-- Успех -->
    {#if fileName && !error}
      <div class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm">Файл загружен: {fileName}</span>
      </div>
    {/if}

    <div class="divider text-xs">ИЛИ</div>

    <button class="btn btn-outline btn-primary" onclick={loadDemoData} disabled={isLoading}>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
      Загрузить демо-данные
    </button>

    <!-- Формат -->
    <div class="bg-base-200 rounded-lg p-3">
      <div class="text-xs font-medium mb-2">Формат CSV:</div>
      <code class="text-[10px] block overflow-x-auto bg-base-300 p-2 rounded">
Год,Общее_количество_инцидентов,Тяжелые_травмы,Смертельные_исходы,...</code>
    </div>
  </div>
</div>
