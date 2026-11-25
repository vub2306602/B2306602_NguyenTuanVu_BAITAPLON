<template>
  <Teleport to="body">
    <Transition name="fade-modal">
      <div
        v-if="confirmStore.isOpen"
        class="custom-modal-backdrop"
        tabindex="-1"
        @keydown.esc="confirmStore.cancel()"
      >
        <div class="custom-modal-dialog">
          <div class="custom-modal-content">
            <!-- Icon header -->
            <div class="text-center pt-4 pb-2">
              <div
                class="modal-icon-bubble"
                :class="`modal-icon-${confirmStore.type}`"
              >
                <i v-if="confirmStore.type === 'danger'" class="bi bi-exclamation-triangle-fill"></i>
                <i v-else-if="confirmStore.type === 'warning'" class="bi bi-question-diamond-fill"></i>
                <i v-else-if="confirmStore.type === 'success'" class="bi bi-check-circle-fill"></i>
                <i v-else class="bi bi-info-circle-fill"></i>
              </div>
              <h5 class="custom-modal-title mt-3 mb-1">
                {{ confirmStore.title }}
              </h5>
              <p class="custom-modal-text text-muted mb-0 px-3">
                {{ confirmStore.message }}
              </p>
            </div>

            <!-- Optional text input (Prompt mode) -->
            <div v-if="confirmStore.requiresInput" class="px-4 py-2">
              <label v-if="confirmStore.inputLabel" class="form-label small fw-semibold text-secondary">
                {{ confirmStore.inputLabel }}
              </label>
              <input
                ref="inputRef"
                v-model="confirmStore.inputValue"
                type="text"
                class="form-control form-control-custom"
                :placeholder="confirmStore.inputPlaceholder || 'Nhập nội dung...'"
                @keydown.enter="confirmStore.confirm()"
              />
            </div>

            <!-- Actions footer -->
            <div class="custom-modal-footer">
              <button
                v-if="confirmStore.showCancel"
                type="button"
                class="btn btn-light custom-btn-cancel"
                @click="confirmStore.cancel()"
              >
                {{ confirmStore.cancelText }}
              </button>
              <button
                type="button"
                class="btn custom-btn-confirm"
                :class="btnClass"
                @click="confirmStore.confirm()"
              >
                {{ confirmStore.confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useConfirmStore } from '@/shared/stores/confirm'

const confirmStore = useConfirmStore()
const inputRef = ref(null)

const btnClass = computed(() => {
  switch (confirmStore.type) {
    case 'danger':
      return 'btn-danger'
    case 'warning':
      return 'btn-warning text-dark'
    case 'success':
      return 'btn-success'
    default:
      return 'btn-primary'
  }
})

watch(
  () => confirmStore.isOpen,
  (newVal) => {
    if (newVal && confirmStore.requiresInput) {
      nextTick(() => {
        if (inputRef.value) {
          inputRef.value.focus()
        }
      })
    }
  }
)
</script>

<style scoped>
.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1095;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.custom-modal-dialog {
  width: 100%;
  max-width: 440px;
  animation: modalPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.custom-modal-content {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 1px 1px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

.modal-icon-bubble {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 0.25rem;
}

.modal-icon-bubble.modal-icon-danger {
  background: #fee2e2;
  color: #dc2626;
}

.modal-icon-bubble.modal-icon-warning {
  background: #fef3c7;
  color: #d97706;
}

.modal-icon-bubble.modal-icon-success {
  background: #dcfce7;
  color: #16a34a;
}

.modal-icon-bubble.modal-icon-primary,
.modal-icon-bubble.modal-icon-info {
  background: #e0f2fe;
  color: #0284c7;
}

.custom-modal-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.25rem;
}

.custom-modal-text {
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-control-custom {
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #e2e8f0;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-control-custom:focus {
  border-color: #0d9488;
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}

.custom-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  margin-top: 1rem;
}

.custom-btn-cancel {
  border-radius: 10px;
  padding: 0.55rem 1.25rem;
  font-weight: 600;
  color: #64748b;
  background: #e2e8f0;
  border: none;
}

.custom-btn-cancel:hover {
  background: #cbd5e1;
  color: #334155;
}

.custom-btn-confirm {
  border-radius: 10px;
  padding: 0.55rem 1.35rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.custom-btn-confirm:hover {
  transform: translateY(-1px);
}

/* Modal animation */
@keyframes modalPop {
  0% {
    opacity: 0;
    transform: scale(0.92) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>

