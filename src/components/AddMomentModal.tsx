import React from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Sparkles, 
  Star, 
  Check,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react';
import { FoodMoment, MomentCategory, FoodMood, EatingPace, DistractionLevel, EnergyLevelAfter } from '../types';
import { MOMENT_LABELS, MOODS, PRESET_PHOTOS } from '../data/momentsData';
import { generateMomentCoachFeedback } from '../utils/coachEngine';

interface AddMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (momentData: Omit<FoodMoment, 'id' | 'createdAt'>) => void;
  editingMoment?: FoodMoment | null;
}

const COMMON_TAGS = [
  'Vegetarisch',
  'Vegan',
  'HighProtein',
  'HomeCooked',
  'Restaurant',
  'SoulFood',
  'CleanEating',
  'LowCarb',
  'Sauerteig',
  'Italienisch',
  'Asiatisch',
  'Süß',
  'CheatMeal',
  'Snack',
  'Bio'
];

export const AddMomentModal: React.FC<AddMomentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMoment,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<MomentCategory>('lunch');
  const [label, setLabel] = React.useState<string>('Mittagessen');
  const [title, setTitle] = React.useState<string>('');
  const [imageUrl, setImageUrl] = React.useState<string>(PRESET_PHOTOS[0].url);
  const [customUrlInput, setCustomUrlInput] = React.useState<string>('');
  const [date, setDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = React.useState<string>(
    new Date().toTimeString().slice(0, 5)
  );
  const [location, setLocation] = React.useState<string>('Home Kitchen');
  const [locationCategory, setLocationCategory] = React.useState<'home' | 'restaurant' | 'cafe' | 'travel' | 'takeaway'>('home');
  const [rating, setRating] = React.useState<number>(5);
  const [mood, setMood] = React.useState<FoodMood>('satisfied');
  const [hungerLevel, setHungerLevel] = React.useState<number>(3);
  const [fullnessLevel, setFullnessLevel] = React.useState<number>(4);
  const [eatingPace, setEatingPace] = React.useState<EatingPace>('moderate');
  const [distraction, setDistraction] = React.useState<DistractionLevel>('mindful');
  const [energyAfter, setEnergyAfter] = React.useState<EnergyLevelAfter>('energized');
  const [notes, setNotes] = React.useState<string>('');
  const [tags, setTags] = React.useState<string[]>(['HomeCooked']);
  const [newTagInput, setNewTagInput] = React.useState<string>('');
  const [calories, setCalories] = React.useState<string>('');
  const [protein, setProtein] = React.useState<string>('');
  const [price, setPrice] = React.useState<string>('');
  const [companions, setCompanions] = React.useState<string>('');
  const [showMoreDetails, setShowMoreDetails] = React.useState<boolean>(false);

  const [activePhotoTab, setActivePhotoTab] = React.useState<'presets' | 'upload' | 'url'>('presets');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Live calculated Coach Feedback
  const liveCoachFeedback = React.useMemo(() => {
    return generateMomentCoachFeedback({
      category: selectedCategory,
      hungerLevel,
      fullnessLevel,
      eatingPace,
      distraction,
      energyAfter,
      nutrition: {
        protein: protein ? parseInt(protein, 10) : undefined,
        calories: calories ? parseInt(calories, 10) : undefined,
      },
    });
  }, [selectedCategory, hungerLevel, fullnessLevel, eatingPace, distraction, energyAfter, protein, calories]);

  // Initialize or reset form when editing or opening
  React.useEffect(() => {
    if (editingMoment) {
      setSelectedCategory(editingMoment.category);
      setLabel(editingMoment.label || MOMENT_LABELS[editingMoment.category]?.label || 'Moment');
      setTitle(editingMoment.title);
      setImageUrl(editingMoment.imageUrl);
      setDate(editingMoment.date);
      setTime(editingMoment.time);
      setLocation(editingMoment.location);
      setLocationCategory(editingMoment.locationCategory);
      setRating(editingMoment.rating);
      setMood(editingMoment.mood);
      setHungerLevel(editingMoment.hungerLevel || 3);
      setFullnessLevel(editingMoment.fullnessLevel || 4);
      setEatingPace(editingMoment.eatingPace || 'moderate');
      setDistraction(editingMoment.distraction || 'mindful');
      setEnergyAfter(editingMoment.energyAfter || 'energized');
      setNotes(editingMoment.notes || '');
      setTags(editingMoment.tags || []);
      setCalories(editingMoment.nutrition?.calories ? String(editingMoment.nutrition.calories) : '');
      setProtein(editingMoment.nutrition?.protein ? String(editingMoment.nutrition.protein) : '');
      setPrice(editingMoment.price || '');
      setCompanions(editingMoment.companions || '');
    } else if (isOpen) {
      const currentHour = new Date().getHours();
      let defaultCat: MomentCategory = 'lunch';
      if (currentHour < 11) defaultCat = 'breakfast';
      else if (currentHour >= 11 && currentHour < 15) defaultCat = 'lunch';
      else if (currentHour >= 15 && currentHour < 18) defaultCat = 'snack';
      else defaultCat = 'dinner';

      setSelectedCategory(defaultCat);
      setLabel(MOMENT_LABELS[defaultCat].label);
      setTitle('');
      const matchedPreset = PRESET_PHOTOS.find((p) => p.category === defaultCat) || PRESET_PHOTOS[0];
      setImageUrl(matchedPreset.url);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setLocation(defaultCat === 'breakfast' ? 'Zuhause' : 'Lieblingsrestaurant');
      setLocationCategory(defaultCat === 'breakfast' ? 'home' : 'restaurant');
      setRating(5);
      setMood('satisfied');
      setHungerLevel(3);
      setFullnessLevel(4);
      setEatingPace('slow');
      setDistraction('mindful');
      setEnergyAfter('energized');
      setNotes('');
      setTags([defaultCat === 'breakfast' ? 'Frühstück' : 'Lecker']);
      setCalories('');
      setProtein('');
      setPrice('');
      setCompanions('');
    }
  }, [editingMoment, isOpen]);

  const handleCategorySelect = (cat: MomentCategory) => {
    setSelectedCategory(cat);
    setLabel(MOMENT_LABELS[cat].label);
    const matchedPreset = PRESET_PHOTOS.find((p) => p.category === cat);
    if (matchedPreset && activePhotoTab === 'presets') {
      setImageUrl(matchedPreset.url);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setNewTagInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedProtein = protein ? parseInt(protein, 10) : undefined;
    const parsedCalories = calories ? parseInt(calories, 10) : undefined;

    const feedback = generateMomentCoachFeedback({
      category: selectedCategory,
      hungerLevel,
      fullnessLevel,
      eatingPace,
      distraction,
      energyAfter,
      nutrition: {
        protein: parsedProtein,
        calories: parsedCalories,
      },
    });

    onSave({
      title: title.trim(),
      label: label.trim() || MOMENT_LABELS[selectedCategory].label,
      category: selectedCategory,
      date,
      time,
      location: location.trim() || 'Zuhause',
      locationCategory,
      imageUrl: imageUrl || PRESET_PHOTOS[0].url,
      rating,
      mood,
      hungerLevel,
      fullnessLevel,
      eatingPace,
      distraction,
      energyAfter,
      coachFeedback: feedback,
      notes: notes.trim(),
      tags,
      isFavorite: editingMoment ? editingMoment.isFavorite : false,
      nutrition: {
        calories: parsedCalories,
        protein: parsedProtein,
      },
      price: price.trim() || undefined,
      companions: companions.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      
      {/* Modal Box */}
      <div className="w-full sm:max-w-2xl bg-white text-stone-900 rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200/80 max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs font-semibold text-amber-600 block">
              Erinnerung festhalten
            </span>
            <h2 className="text-lg sm:text-xl font-display font-bold text-stone-900">
              {editingMoment ? 'Moment bearbeiten' : 'Neuen Food Moment anlegen'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
          
          {/* Section 1: Moment.Label & Category Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              1. Mahlzeit & Kategorie
            </label>
            
            {/* Category Selector Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(MOMENT_LABELS).map(([key, item]) => {
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleCategorySelect(key as MomentCategory)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Label Input */}
            <div className="pt-2 flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium whitespace-nowrap">Benutzerdefiniertes Label:</span>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="z.B. Sonntagsbrunch, Post-Workout Snack"
                className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-lg focus:border-amber-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Section 2: Meal Title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              2. Name des Gerichts *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Cremige Trüffelpasta mit Parmesan"
              className="w-full px-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-amber-500 focus:bg-white focus:outline-hidden font-display font-medium text-stone-900"
            />
          </div>

          {/* Section 3: Photo Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">
                3. Foto auswählen
              </label>
              
              {/* Photo Source Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('presets')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activePhotoTab === 'presets'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('upload')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activePhotoTab === 'upload'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab('url')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    activePhotoTab === 'url'
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  URL
                </button>
              </div>
            </div>

            {/* Photo preview container */}
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
              <img
                src={imageUrl}
                alt="Gericht Vorschau"
                className="w-full h-full object-cover group-hover:scale-102 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white text-stone-900 font-semibold text-xs rounded-xl shadow-md flex items-center gap-1.5 hover:bg-stone-50"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Neues Foto wählen</span>
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            {activePhotoTab === 'presets' && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {PRESET_PHOTOS.map((photo, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setImageUrl(photo.url)}
                    className={`relative aspect-4/3 rounded-xl overflow-hidden border-2 transition-all ${
                      imageUrl === photo.url
                        ? 'border-amber-500 ring-2 ring-amber-500/30 scale-95'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    {imageUrl === photo.url && (
                      <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                        <Check className="w-5 h-5 text-white font-bold drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* File Upload Tab */}
            {activePhotoTab === 'upload' && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer bg-stone-50 hover:bg-amber-50/20 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                <p className="font-semibold text-xs text-stone-800">
                  Foto vom Smartphone oder Computer hochladen
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  PNG, JPG oder WEBP
                </p>
              </div>
            )}

            {/* URL Tab */}
            {activePhotoTab === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrlInput) setImageUrl(customUrlInput);
                  }}
                  className="px-4 py-2 bg-stone-900 text-white font-medium text-xs rounded-xl hover:bg-stone-800"
                >
                  Übernehmen
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Rating & Food Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            
            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                4. Wie hat es dir geschmeckt? ({rating} von 5 Sternen)
              </label>
              <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mood Feeling */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Gefühl & Zufriedenheit
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as FoodMood)}
                className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:outline-hidden font-medium"
              >
                {Object.entries(MOODS).map(([key, m]) => (
                  <option key={key} value={key} className="bg-white text-stone-900">
                    {m.emoji} {m.label} ({m.description})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Optional Collapsible Details Toggle */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full py-2.5 px-4 bg-stone-100/90 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold rounded-2xl transition-all flex items-center justify-between border border-stone-200/60"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                <span>{showMoreDetails ? 'Zusätzliche Details ausblenden' : '➕ Mehr Details & Notizen (optional)'}</span>
              </div>
              {showMoreDetails ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>
          </div>

          {/* Collapsible Advanced Section */}
          {showMoreDetails && (
            <div className="space-y-4 pt-1 border-t border-stone-200/60 animate-in fade-in duration-150">
              
              {/* Date, Time & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Datum
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Uhrzeit
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Ort / Restaurant
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="z. B. Zuhause oder Restaurant"
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Mindful Eating Coaching Controls */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-amber-600" />
                    <span>Achtsamkeits-Check (Hunger & Sättigung)</span>
                  </span>
                </div>

                {/* Sliders: Hunger & Sättigung */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-stone-200/60">
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>Hunger davor (1=Wenig, 5=Heißhunger):</span>
                      <span className="font-semibold text-amber-600">{hungerLevel} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={hungerLevel}
                      onChange={(e) => setHungerLevel(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200/60">
                    <div className="flex justify-between text-stone-600 mb-1">
                      <span>Sättigung danach (1=Hungrig, 4=Perfekt, 5=Übervoll):</span>
                      <span className="font-semibold text-emerald-600">{fullnessLevel} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={fullnessLevel}
                      onChange={(e) => setFullnessLevel(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Mindful Details (Pace, Distraction, Energy) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      ⏱️ Ess-Tempo
                    </label>
                    <select
                      value={eatingPace}
                      onChange={(e) => setEatingPace(e.target.value as EatingPace)}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200 text-stone-800 rounded-xl focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="slow">In Ruhe / Langsam genossen</option>
                      <option value="moderate">Normales Tempo</option>
                      <option value="rushed">Gehetzt / Nebenbei geschlungen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      🧘 Fokus & Screen
                    </label>
                    <select
                      value={distraction}
                      onChange={(e) => setDistraction(e.target.value as DistractionLevel)}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200 text-stone-800 rounded-xl focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="mindful">Ohne Ablenkung / Voll achtsam</option>
                      <option value="social">In geselliger Runde</option>
                      <option value="screen">Mit Smartphone / TV / Video</option>
                      <option value="work">Beim Arbeiten / Am Schreibtisch</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      ⚡ Gefühl danach
                    </label>
                    <select
                      value={energyAfter}
                      onChange={(e) => setEnergyAfter(e.target.value as EnergyLevelAfter)}
                      className="w-full px-2.5 py-2 bg-white border border-stone-200 text-stone-800 rounded-xl focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="energized">Voller Energie & fit</option>
                      <option value="neutral">Ausgeglichen & zufrieden</option>
                      <option value="sluggish">Leicht träge / müde</option>
                      <option value="heavy">Sehr schwer / Food-Koma</option>
                    </select>
                  </div>
                </div>

                {/* Live Coach Feedback Preview */}
                <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Coach-Impuls: {liveCoachFeedback.title}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                      {liveCoachFeedback.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {liveCoachFeedback.message}
                  </p>
                </div>
              </div>

              {/* Notes & Story */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-700">
                  Notizen & Geschmackserlebnis
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Wie hat es geschmeckt? Besondere Zutaten oder Aromen..."
                  className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-200 text-stone-900 rounded-xl focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700">
                  Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TAGS.slice(0, 8).map((tag) => {
                    const isSelected = tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-white shadow-2xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Nutrition & Price */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <label className="block text-[10px] text-stone-500 mb-1">Kalorien (kcal)</label>
                  <input
                    type="number"
                    placeholder="z.B. 650"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-lg focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    placeholder="z.B. 32"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-lg focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-500 mb-1">Preis (€)</label>
                  <input
                    type="text"
                    placeholder="z.B. 14,50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 text-stone-900 rounded-lg focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingMoment ? 'Änderungen speichern' : 'Moment speichern'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

