import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, 
  Bug, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Camera, 
  ChevronRight,
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  Search,
  ArrowRight,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCropAdvice, diagnosePlant, getMarketTrends } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Crop {
  id: number;
  name: string;
  variety: string;
  planted_date: string;
  status: string;
}

interface Task {
  id: number;
  crop_id: number;
  crop_name: string;
  task_name: string;
  due_date: string;
  completed: number;
}

interface Diagnosis {
  plantName: string;
  healthStatus: string;
  diagnosis: string;
  treatment: string[];
  urgency: string;
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: Sprout, label: 'My Farm' },
    { id: 'diagnosis', icon: Bug, label: 'Health' },
    { id: 'market', icon: TrendingUp, label: 'Market' },
    { id: 'ai', icon: MessageSquare, label: 'Agri-AI' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass-card px-4 py-2 flex items-center gap-1 shadow-2xl border-sage-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all duration-300",
              activeTab === tab.id 
                ? "bg-sage-600 text-white shadow-lg" 
                : "text-sage-600 hover:bg-sage-50"
            )}
          >
            <tab.icon size={20} />
            <span className={cn("text-sm font-medium", activeTab !== tab.id && "hidden md:block")}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: '', variety: '', planted_date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    fetchCrops();
    fetchTasks();
  }, []);

  const fetchCrops = async () => {
    const res = await fetch('/api/crops');
    const data = await res.json();
    setCrops(data);
  };

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/crops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCrop),
    });
    setShowAddCrop(false);
    fetchCrops();
  };

  const toggleTask = async (id: number, completed: boolean) => {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
    fetchTasks();
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 glass-card p-8 bg-gradient-to-br from-sage-500 to-sage-700 text-white border-none">
          <h1 className="text-4xl mb-2">Welcome back, Farmer</h1>
          <p className="opacity-90 font-light italic">"The best time to plant a tree was 20 years ago. The second best time is now."</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Thermometer size={20} className="mb-2" />
              <div className="text-2xl font-bold">28°C</div>
              <div className="text-xs opacity-70">Temperature</div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Droplets size={20} className="mb-2" />
              <div className="text-2xl font-bold">65%</div>
              <div className="text-xs opacity-70">Humidity</div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <CloudSun size={20} className="mb-2" />
              <div className="text-2xl font-bold">Sunny</div>
              <div className="text-xs opacity-70">Weather</div>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Wind size={20} className="mb-2" />
              <div className="text-2xl font-bold">12km/h</div>
              <div className="text-xs opacity-70">Wind</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Crops */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">My Crops</h2>
            <button onClick={() => setShowAddCrop(true)} className="btn-secondary py-2 px-4 text-sm">
              <Plus size={16} /> Add Crop
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crops.map((crop) => (
              <motion.div 
                key={crop.id} 
                layoutId={`crop-${crop.id}`}
                className="glass-card p-6 hover:border-sage-300 transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-sage-100 p-3 rounded-2xl text-sage-600 group-hover:bg-sage-600 group-hover:text-white transition-colors">
                    <Sprout size={24} />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-wider text-sage-500 bg-sage-50 px-2 py-1 rounded-md">
                    {crop.status}
                  </span>
                </div>
                <h3 className="text-xl mb-1">{crop.name}</h3>
                <p className="text-sm text-sage-600 mb-4">{crop.variety}</p>
                <div className="flex items-center justify-between text-xs text-sage-400">
                  <span>Planted: {format(new Date(crop.planted_date), 'MMM dd, yyyy')}</span>
                  <ChevronRight size={16} />
                </div>
              </motion.div>
            ))}
            {crops.length === 0 && (
              <div className="col-span-full py-12 text-center glass-card border-dashed border-sage-300">
                <p className="text-sage-400 italic">No crops added yet. Start your journey today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-4">
          <h2 className="text-2xl">Daily Tasks</h2>
          <div className="glass-card p-6 space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 group cursor-pointer" onClick={() => toggleTask(task.id, !!task.completed)}>
                <button className={cn(
                  "mt-1 transition-colors",
                  task.completed ? "text-sage-500" : "text-sage-300 group-hover:text-sage-400"
                )}>
                  {task.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium",
                    task.completed && "line-through text-sage-400"
                  )}>{task.task_name}</p>
                  <p className="text-xs text-sage-400">{task.crop_name} • Due {format(new Date(task.due_date), 'MMM dd')}</p>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-sage-400 text-sm italic py-4">All caught up!</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Crop Modal */}
      <AnimatePresence>
        {showAddCrop && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card p-8 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl">Add New Crop</h2>
                <button onClick={() => setShowAddCrop(false)} className="text-sage-400 hover:text-sage-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddCrop} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">Crop Name</label>
                  <input 
                    required
                    type="text" 
                    value={newCrop.name}
                    onChange={(e) => setNewCrop({...newCrop, name: e.target.value})}
                    className="w-full bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                    placeholder="e.g. Tomato"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">Variety</label>
                  <input 
                    type="text" 
                    value={newCrop.variety}
                    onChange={(e) => setNewCrop({...newCrop, variety: e.target.value})}
                    className="w-full bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                    placeholder="e.g. Cherry Tomato"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-sage-500 mb-1">Planting Date</label>
                  <input 
                    type="date" 
                    value={newCrop.planted_date}
                    onChange={(e) => setNewCrop({...newCrop, planted_date: e.target.value})}
                    className="w-full bg-sage-50 border border-sage-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center mt-4">
                  Save Crop
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HealthDiagnosis = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runDiagnosis = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await diagnosePlant(base64);
      setDiagnosis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="text-center space-y-2">
        <h1 className="text-4xl">Plant Health Diagnosis</h1>
        <p className="text-sage-600">Upload a photo of your plant to identify pests or diseases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "aspect-square glass-card flex flex-col items-center justify-center border-2 border-dashed border-sage-300 cursor-pointer overflow-hidden relative group",
              image && "border-none"
            )}
          >
            {image ? (
              <>
                <img src={image} alt="Plant" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={32} />
                </div>
              </>
            ) : (
              <div className="text-center p-8">
                <div className="bg-sage-100 p-6 rounded-full text-sage-600 mb-4 mx-auto w-fit">
                  <Camera size={48} />
                </div>
                <p className="font-medium">Click to upload or take a photo</p>
                <p className="text-xs text-sage-400 mt-2">Supports JPG, PNG</p>
              </div>
            )}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*" 
          />
          
          <button 
            disabled={!image || loading}
            onClick={runDiagnosis}
            className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Bug size={20} />}
            {loading ? 'Analyzing...' : 'Diagnose Plant'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {diagnosis ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-8 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl">{diagnosis.plantName}</h2>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                    diagnosis.healthStatus === 'Healthy' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {diagnosis.healthStatus}
                  </span>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  diagnosis.urgency === 'High' ? "bg-red-600 text-white" : "bg-orange-100 text-orange-700"
                )}>
                  {diagnosis.urgency} Urgency
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400">Diagnosis</h4>
                <p className="text-sage-700 leading-relaxed">{diagnosis.diagnosis}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sage-400">Recommended Treatment</h4>
                <ul className="space-y-2">
                  {diagnosis.treatment.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-sage-700">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : (
            !loading && (
              <div className="glass-card p-8 flex flex-col items-center justify-center text-center border-dashed border-sage-200">
                <Sprout size={48} className="text-sage-200 mb-4" />
                <p className="text-sage-400 italic">Upload an image to see the diagnosis results here.</p>
              </div>
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MarketHub = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await getMarketTrends();
        setTrends(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, []);

  const chartData = [
    { name: 'Jan', price: 400 },
    { name: 'Feb', price: 450 },
    { name: 'Mar', price: 420 },
    { name: 'Apr', price: 500 },
    { name: 'May', price: 550 },
    { name: 'Jun', price: 530 },
  ];

  return (
    <div className="space-y-8 pb-32">
      <div className="text-center space-y-2">
        <h1 className="text-4xl">Market Insights</h1>
        <p className="text-sage-600">Stay updated with global crop prices and future outlooks.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl">Price Index (Wheat)</h2>
            <select className="bg-sage-50 border border-sage-200 rounded-xl px-4 py-2 text-sm focus:outline-none">
              <option>Wheat</option>
              <option>Rice</option>
              <option>Corn</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a805a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5a805a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="price" stroke="#5a805a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl">Global Trends</h2>
          <div className="space-y-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="glass-card p-4 animate-pulse h-24" />
              ))
            ) : (
              trends.map((trend, i) => (
                <div key={i} className="glass-card p-5 group hover:border-sage-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg">{trend.crop}</h3>
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded-md",
                      trend.priceTrend === 'Rising' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {trend.priceTrend}
                    </span>
                  </div>
                  <div className="text-2xl font-serif text-sage-800 mb-2">{trend.currentPrice}</div>
                  <p className="text-xs text-sage-500 italic">{trend.outlook}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AgriAIChat = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await getCropAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'ai', content: response || "I couldn't process that. Please try again." }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-200px)] flex flex-col pb-32">
      <div className="text-center mb-8">
        <h1 className="text-4xl mb-2">Agri-AI Assistant</h1>
        <p className="text-sage-600">Ask anything about farming, soil, or crop management.</p>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageSquare size={48} className="mb-4" />
              <p className="italic">How can I help you today?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-6 max-w-md">
                {["Best time to plant wheat?", "How to treat leaf rust?", "Organic pest control?", "Soil testing tips"].map(q => (
                  <button key={q} onClick={() => setInput(q)} className="text-xs border border-sage-300 rounded-full px-4 py-2 hover:bg-sage-50">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "items-start"
            )}>
              <div className={cn(
                "px-5 py-3 rounded-3xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-sage-600 text-white rounded-tr-none" 
                  : "bg-sage-100 text-sage-800 rounded-tl-none"
              )}>
                <div className="prose prose-sm prose-sage max-w-none">
                  <Markdown>
                    {msg.content}
                  </Markdown>
                </div>
              </div>
              <span className="text-[10px] text-sage-400 mt-1 px-2">
                {msg.role === 'user' ? 'You' : 'AgriSmart AI'}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="bg-sage-100 px-5 py-3 rounded-3xl rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-sage-400" />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-sage-100 bg-white/50">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="w-full bg-sage-50 border border-sage-200 rounded-2xl px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-all"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-50 transition-all"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-earth-50">
      <header className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-sage-600 text-white p-2 rounded-xl">
            <Sprout size={24} />
          </div>
          <span className="text-2xl font-serif font-bold tracking-tight text-sage-900">AgriSmart</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sage-600">
            <Search size={20} />
            <span className="text-sm font-medium">Search</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-sage-200 border-2 border-white shadow-sm overflow-hidden">
            <img src="https://picsum.photos/seed/farmer/100/100" alt="Profile" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'diagnosis' && <HealthDiagnosis />}
            {activeTab === 'market' && <MarketHub />}
            {activeTab === 'ai' && <AgriAIChat />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
