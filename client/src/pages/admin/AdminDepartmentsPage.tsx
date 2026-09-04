import { useEffect, useState } from 'react';
import { departmentApi } from '../../services';
import type { Department } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Card, { EmptyState } from '../../components/ui/Card';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    departmentApi.list({ limit: '50' }).then(({ data }) => {
      if (data.success && data.data) setDepartments(data.data.items);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        await departmentApi.update(editing._id, form);
      } else {
        await departmentApi.create(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', description: '' });
      fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department?')) return;
    try {
      await departmentApi.delete(id);
      fetch();
    } catch {
      setError('Delete failed');
    }
  };

  const startEdit = (dept: Department) => {
    setEditing(dept);
    setForm({ name: dept.name, description: dept.description || '' });
    setShowForm(true);
  };

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', description: '' }); }}>Add Department</Button>
      </div>
      {error && <Alert message={error} className="mt-4" />}

      {showForm && (
        <Card className="mt-6" title={editing ? 'Edit Department' : 'New Department'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Button type="submit" loading={submitting}>{editing ? 'Update' : 'Create'}</Button>
              <Button variant="outline" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {departments.length === 0 ? (
        <EmptyState title="No departments" />
      ) : (
        <div className="mt-6 space-y-3">
          {departments.map((dept) => (
            <Card key={dept._id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{dept.name}</h3>
                  <p className="text-sm text-gray-500">{dept.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(dept)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(dept._id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
