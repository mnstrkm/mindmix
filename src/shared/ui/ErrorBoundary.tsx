import { Component, type ReactNode } from 'react';
import i18n from '../../i18n';
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="panel" role="alert"><p>{i18n.t('loadError')}</p><button className="button primary" onClick={() => window.location.reload()}>{i18n.t('reload')}</button></div>;
    return this.props.children;
  }
}
