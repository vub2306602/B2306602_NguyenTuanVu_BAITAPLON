<template>
  <div class="toast-wrapper position-fixed top-0 end-0 p-3" style="z-index: 1100;">
    <TransitionGroup name="toast-list" tag="div" class="d-flex flex-column gap-2">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="modern-toast shadow-lg d-flex align-items-center"
        :class="`toast-${toast.type}`"
        role="alert"
      >
        <div class="toast-icon-wrap me-3">
          <i v-if="toast.type === 'success'" class="bi bi-check-circle-fill"></i>
          <i v-else-if="toast.type === 'danger'" class="bi bi-x-circle-fill"></i>
          <i v-else-if="toast.type === 'warning'" class="bi bi-exclamation-triangle-fill"></i>
          <i v-else class="bi bi-info-circle-fill"></i>
        </div>
        <div class="toast-body-content flex-grow-1 pe-2">
          <div class="toast-msg">{{ toast.message }}</div>
        </div>
        <button
          type="button"
          class="btn-close-custom"
          aria-label="Close"
          @click="toastStore.remove(toast.id)"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToastStore } from '@/shared/stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-wrapper {
  pointer-events: none;
  max-width: 420px;
  width: 100%;
}

.modern-toast {
  pointer-events: auto;
  min-width: 300px;
  max-width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  background: #ffffff;
  border-left: 5px solid #0d9488;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-success {
  border-left-color: #10b981;
}
.toast-success .toast-icon-wrap {
  color: #10b981;
  background: #ecfdf5;
}

.toast-danger {
  border-left-color: #ef4444;
}
.toast-danger .toast-icon-wrap {
  color: #ef4444;
  background: #fef2f2;
}

.toast-warning {
  border-left-color: #f59e0b;
}
.toast-warning .toast-icon-wrap {
  color: #f59e0b;
  background: #fffbeb;
}

.toast-info {
  border-left-color: #0ea5e9;
}
.toast-info .toast-icon-wrap {
  color: #0ea5e9;
  background: #f0f9ff;
}

.toast-icon-wrap {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.toast-body-content {
  font-size: 0.925rem;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
  word-break: break-word;
}

.btn-close-custom {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-custom:hover {
  color: #475569;
  background: #f1f5f9;
}

/* Animations */
.toast-list-enter-active {
  animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-list-leave-active {
  animation: toastOut 0.25s ease-in forwards;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(30px);
  }
}
</style>
