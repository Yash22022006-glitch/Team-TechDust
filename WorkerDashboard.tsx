import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Loader2, CheckCircle2, X } from 'lucide-react';
import { verifyResolution } from '../services/gemini';
import { motion } from 'motion/react';

interface WorkerDashboardProps {
  reports: any[];
  onUpdate: () => void;
}

export default function WorkerDashboard({ reports, onUpdate }: WorkerDashboardProps) {
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const assignedTasks = reports.filter(r => r.status === 'assigned');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader();
    reader.onload = () => setProofImage(reader.result as string);
    reader.readAsDataURL(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleResolve = async () => {
    if (!proofImage || !activeTask) return;
    setIsVerifying(true);

    try {
      // 1. AI Verification
      const verification = await verifyResolution(activeTask.type, proofImage);

      // 2. Update Server
      await fetch(`/api/reports/${activeTask.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proof_image_url: proofImage })
      });

      await fetch(`/api/reports/${activeTask.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: verification.verified ? 'verified' : 'rejected' })
      });

      alert(verification.verified ? "Task verified and closed!" : `AI rejected proof: ${verification.reason}`);
      setActiveTask(null);
      setProofImage(null);
      onUpdate();
    } catch (err) {
      alert("Error processing task");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        My Assignments
      </h2>

      {assignedTasks.length === 0 ? (
        <div className="text-center py-10 bg-neutral-900/50 rounded-2xl border border-white/5">
          <p className="text-neutral-500 text-sm">No tasks assigned to you.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignedTasks.map(task => (
            <div key={task.id} className="bg-neutral-900 border border-white/10 rounded-2xl p-4">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Task #{task.id}</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Assigned</span>
              </div>
              <h3 className="font-bold capitalize mb-1">{task.type.replace('_', ' ')}</h3>
              <p className="text-xs text-neutral-400 mb-4">{task.description}</p>
              <button
                onClick={() => setActiveTask(task)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Complete Task
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="bg-neutral-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 border-t sm:border border-white/10"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Resolve Task</h3>
              <button onClick={() => setActiveTask(null)} className="p-2 bg-white/5 rounded-full"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Original Issue</p>
                <p className="text-sm">{activeTask.description}</p>
              </div>

              {!proofImage ? (
                <div {...getRootProps()} className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center cursor-pointer">
                  <input {...getInputProps()} />
                  <Camera className="mx-auto mb-2 text-neutral-500" />
                  <p className="text-xs text-neutral-400">Upload proof of resolution</p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10">
                  <img src={proofImage} className="w-full h-full object-cover" />
                  <button onClick={() => setProofImage(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"><X size={16} /></button>
                </div>
              )}

              <button
                onClick={handleResolve}
                disabled={!proofImage || isVerifying}
                className="w-full py-4 bg-emerald-600 disabled:bg-neutral-800 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                Submit for AI Verification
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
