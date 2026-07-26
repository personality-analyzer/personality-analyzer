import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error('App error:', error, info); }
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ fontFamily: 'Tajawal, sans-serif', padding: 24, maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h2 style={{ color: '#b91c1c', margin: '10px 0' }}>حدث خطأ غير متوقّع</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>حاول إعادة المحاولة، أو حدّث الصفحة. تفاصيل الخطأ:</p>
          <pre style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: 12, borderRadius: 8, fontSize: 12, textAlign: 'left', overflow: 'auto', direction: 'ltr' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button onClick={this.reset} style={{ background: '#0e7490', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'inherit', fontWeight: 700, cursor: 'pointer' }}>
            إعادة المحاولة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
