#bootOverlay {
  position: fixed;
  inset: 0;
  background: #020308;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.boot-logo {
  width: 90px;
  animation: pulse 2s ease-in-out infinite;
}

.boot-text {
  margin-top: 20px;
  font-size: 1rem;
  color: var(--accent);
  font-weight: bold;
}

.boot-bar {
  margin-top: 20px;
  width: 200px;
  height: 6px;
  background: #1a1c24;
  border-radius: 20px;
  overflow: hidden;
}

.boot-bar-fill {
  width: 0%;
  height: 100%;
  background: linear-gradient(to right, var(--blue), var(--accent2));
  transition: width 0.4s ease;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}