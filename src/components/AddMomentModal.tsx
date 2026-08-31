import React from 'react';
import { Camera, Check, ChevronDown, ImagePlus, X } from 'lucide-react';
import { FoodMoment, MomentCategory } from '../types';
import { MOMENT_LABELS, PRESET_PHOTOS } from '../data/momentsData';
import { getLocalDateKey } from '../utils/dateKey';

interface AddMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (momentData: Omit<FoodMoment, 'id' | 'createdAt'>) => void;
  editingMoment?: FoodMoment | null;
}

const categories: MomentCategory[] = ['breakfast', 'lunch', 'dinner', 'snack', 'coffee', 'dessert'];

const categoryForHour = (hour: number): MomentCategory => {
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 18) return 'snack';
  return 'dinner';
};

export const AddMomentModal: React.FC<AddMomentModalProps> = ({ isOpen, onClose, onSave, editingMoment }) => {
  const [category, setCategory] = React.useState<MomentCategory>('lunch');
  const [imageUrl, setImageUrl] = React.useState('');
  const [autoTitle, setAutoTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [showMore, setShowMore] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    if (editingMoment) {
      setCategory(editingMoment.category);
      setImageUrl(editingMoment.imageUrl);
      setAutoTitle(editingMoment.title);
      setNotes(editingMoment.notes || '');
      setShowMore(Boolean(editingMoment.notes));
      return;
    }

    const defaultCategory = categoryForHour(new Date().getHours());
    const preset = PRESET_PHOTOS.find((photo) => photo.category === defaultCategory) || PRESET_PHOTOS[0];
    setCategory(defaultCategory);
    setImageUrl(preset.url);
    setAutoTitle(preset.title || MOMENT_LABELS[defaultCategory].label);
    setNotes('');
    setShowMore(false);
  }, [isOpen, editingMoment]);

  const chooseCategory = (next: MomentCategory) => {
    setCategory(next);
    const preset = PRESET_PHOTOS.find((photo) => photo.category === next);
    if (preset) {
      setImageUrl(preset.url);
      setAutoTitle(preset.title);
    } else {
      setAutoTitle(MOMENT_LABELS[next].label);
    }
  };

  const choosePreset = (photo: (typeof PRESET_PHOTOS)[number]) => {
    setImageUrl(photo.url);
    setAutoTitle(photo.title || MOMENT_LABELS[category].label);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setAutoTitle(MOMENT_LABELS[category].label);
      }
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    const now = new Date();
    const label = MOMENT_LABELS[category].label;
    const title = autoTitle.trim() || label;

    onSave({
      title,
      label,
      category,
      date: editingMoment?.date || getLocalDateKey(now),
      time: editingMoment?.time || now.toTimeString().slice(0, 5),
      location: editingMoment?.location || 'Nicht angegeben',
      locationCategory: editingMoment?.locationCategory || 'home',
      imageUrl: imageUrl || PRESET_PHOTOS[0].url,
      rating: editingMoment?.rating || 5,
      mood: editingMoment?.mood || 'satisfied',
      hungerLevel: editingMoment?.hungerLevel,
      fullnessLevel: editingMoment?.fullnessLevel,
      eatingPace: editingMoment?.eatingPace,
      distraction: editingMoment?.distraction,
      energyAfter: editingMoment?.energyAfter,
      coachFeedback: editingMoment?.coachFeedback,
      notes: notes.trim() || undefined,
      tags: editingMoment?.tags || [],
      isFavorite: editingMoment?.isFavorite || false,
      nutrition: editingMoment?.nutrition || {},
      price: editingMoment?.price,
      companions: editingMoment?.companions,
    });
    onClose();
  };

  if (!isOpen) return null;

  const matchingPhotos = PRESET_PHOTOS.filter((photo) => photo.category === category);
  const visiblePhotos = matchingPhotos.length > 0 ? matchingPhotos : PRESET_PHOTOS.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/45 backdrop-blur-sm sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-[34px] sm:rounded-[34px] bg-[#FFF9F2] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-[#FFF9F2]/95 px-5 pt-5 pb-3 backdrop-blur-xl">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#A76042]">Moment</p>
            <h2 className="mt-1 text-2xl font-display font-black text-[#31221C]">Was gab's?</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#F1E4D8] text-[#6D5144] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2922]" aria-label="Schließen">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((item) => {
              const active = item === category;
              return (
                <button key={item} type="button" onClick={() => chooseCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-extrabold transition ${active ? 'bg-[#34251E] text-white' : 'bg-[#F1E4D8] text-[#76594A]'}`}>
                  {MOMENT_LABELS[item].label}
                </button>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {visiblePhotos.map((photo) => {
              const selected = imageUrl === photo.url;
              return (
                <button key={photo.url} type="button" onClick={() => choosePreset(photo)} className={`relative aspect-square overflow-hidden rounded-[24px] ${selected ? 'ring-4 ring-[#E86F45] ring-offset-2 ring-offset-[#FFF9F2]' : ''}`} aria-label={photo.title}>
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  {selected && <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[#E86F45] shadow"><Check className="h-5 w-5" /></span>}
                </button>
              );
            })}

            <button type="button" onClick={() => fileRef.current?.click()} className="aspect-square rounded-[24px] border-2 border-dashed border-[#DABFAE] bg-[#FFF1E4] text-[#87563F] flex flex-col items-center justify-center">
              <Camera className="h-7 w-7" />
              <span className="mt-2 text-xs font-extrabold">Eigenes Foto</span>
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />

          <button type="button" onClick={() => setShowMore((value) => !value)} className="mt-5 flex w-full items-center justify-between rounded-2xl bg-[#F3E8DD] px-4 py-3 text-sm font-bold text-[#6E5143]">
            <span className="flex items-center gap-2"><ImagePlus className="h-4 w-4" />Optional etwas merken</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </button>

          {showMore && (
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="z. B. besonders lecker, mit Freunden …" rows={3} className="mt-3 w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-[#3A2922] outline-none ring-1 ring-[#E7D6C9] focus:ring-2 focus:ring-[#E86F45]" />
          )}

          <button type="button" onClick={save} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#E86F45] px-5 py-4 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(199,82,47,.25)] active:scale-[.99]">
            <Check className="h-5 w-5" />
            {editingMoment ? 'Änderungen speichern' : 'Moment speichern'}
          </button>
          <p className="mt-2 text-center text-[11px] text-[#9A7A69]">Kein Text nötig. Bild wählen, speichern, fertig.</p>
        </div>
      </div>
    </div>
  );
};