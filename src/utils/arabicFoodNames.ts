import type { FoodSuggestion } from './foodSuggestions';
import type { AppLanguage } from '../i18n';

const ar: Record<string,string> = {
'Avocado toast':'توست بالأفوكادو','Scrambled eggs':'بيض مخفوق','Greek yogurt with fruit':'زبادي يوناني مع الفاكهة','Oatmeal with berries':'شوفان مع التوت','Pancakes':'بان كيك','Croissant':'كرواسون','Smoothie bowl':'وعاء سموذي','Granola bowl':'جرانولا مع الزبادي','Egg sandwich':'ساندويتش بيض','Fruit bowl':'طبق فواكه',
'Chicken and rice':'دجاج مع الأرز','Pasta with tomato sauce':'مكرونة بصلصة الطماطم','Caesar salad':'سلطة سيزر','Salmon with vegetables':'سلمون مع الخضار','Buddha bowl':'وعاء خضار وحبوب','Vegetable wrap':'راب بالخضار','Chicken curry':'كاري الدجاج','Burger and fries':'برغر مع البطاطس','Spaghetti and meatballs':'سباغيتي مع كرات اللحم','Vegetable soup':'شوربة خضار','Couscous salad':'سلطة كسكس','Club sandwich':'كلوب ساندويتش','Tuna sandwich':'ساندويتش تونة','Rice bowl':'وعاء أرز','Grilled chicken salad':'سلطة دجاج مشوي',
'Steak and potatoes':'ستيك مع البطاطس','Beef stir-fry':'لحم بقري مقلي مع الخضار','Shrimp pasta':'مكرونة بالروبيان','Vegetable stir-fry':'خضار مقلية','Mushroom pasta':'مكرونة بالفطر','Lasagna':'لازانيا','Tomato soup':'شوربة طماطم','Stuffed peppers':'فلفل محشي','Roast chicken':'دجاج مشوي','Grilled fish':'سمك مشوي','Pizza':'بيتزا','Sushi':'سوشي','Tacos':'تاكوس','Ramen':'رامن','Risotto':'ريزوتو',
'Apple':'تفاح','Banana':'موز','Nuts':'مكسرات','Protein yogurt':'زبادي غني بالبروتين','Hummus and vegetables':'حمص مع الخضار','Dark chocolate':'شوكولاتة داكنة','Cheese and crackers':'جبن مع مقرمشات','Dates':'تمر','Espresso':'إسبريسو','Cappuccino':'كابتشينو','Latte':'لاتيه','Tea':'شاي','Matcha latte':'لاتيه ماتشا','Cheesecake':'تشيز كيك','Ice cream':'آيس كريم','Chocolate cake':'كيك الشوكولاتة','Fruit salad':'سلطة فواكه','Tiramisu':'تيراميسو',
'Moroccan mint tea':'شاي مغربي بالنعناع','Msemen':'مسمن','Baghrir':'بغرير','Harcha':'حرشة','Khobz with olive oil':'خبز بزيت الزيتون','Bissara':'بيصارة','Chicken tagine with preserved lemon':'طاجين الدجاج بالحامض المصير','Beef tagine with prunes':'طاجين اللحم بالبرقوق','Vegetable tagine':'طاجين الخضار','Couscous with seven vegetables':'كسكس بسبع خضار','Rfissa':'رفيسة','Harira':'حريرة','Pastilla':'بسطيلة','Kefta tagine':'طاجين الكفتة','Grilled sardines':'سردين مشوي','Taktouka and bread':'تكتوكة مع الخبز','Zaalouk and bread':'زعلوك مع الخبز','Lamb tagine':'طاجين لحم الغنم','Kefta skewers':'أسياخ كفتة','Tangia':'طنجية','Seffa medfouna':'سفة مدفونة','Briouat':'بريوات','Chebakia':'شباكية','Sellou':'سلو','Orange with cinnamon':'برتقال بالقرفة',
'Bread rolls with cheese':'خبز صغير مع الجبن','Muesli':'موسلي','Pretzel':'بريتزل','Currywurst':'نقانق بالكاري','Schnitzel with potatoes':'شنيتزل مع البطاطس','Potato soup':'شوربة بطاطس','Käsespätzle':'سباتزل بالجبن','Bratwurst':'نقانق براتفورست','Döner kebab':'دونر كباب','Apple strudel':'سترودل التفاح',
'Croissant and coffee':'كرواسون مع القهوة','Pain au chocolat':'بان أو شوكولا','Croque monsieur':'كروك موسيو','Quiche Lorraine':'كيش لورين','Salade niçoise':'سلطة نيسواز','Ratatouille':'راتاتوي','Steak frites':'ستيك مع البطاطس المقلية','Boeuf bourguignon':'لحم بورغينيون','Crème brûlée':'كريم بروليه',
'Cornetto and cappuccino':'كورنيتو مع كابتشينو','Caprese salad':'سلطة كابريزي','Pasta carbonara':'مكرونة كاربونارا','Pasta pomodoro':'مكرونة بومودورو','Margherita pizza':'بيتزا مارغريتا','Gnocchi':'نيوكي','Gelato':'جيلاتو',
'Pan con tomate':'خبز بالطماطم','Tortilla española':'تورتيلا إسبانية','Paella':'باييلا','Gazpacho':'غازباتشو','Patatas bravas':'بطاطس برافاس','Croquetas':'كروكيت','Churros':'تشوروس',
'Turkish breakfast':'فطور تركي','Menemen':'مينيمن','Simit':'سميت','Lentil soup':'شوربة عدس','Döner':'دونر','Pide':'بيده','Köfte':'كفتة تركية','Adana kebab':'كباب أضنة','Baklava':'بقلاوة',
'Full English breakfast':'فطور إنجليزي كامل','Porridge':'عصيدة الشوفان','Beans on toast':'فاصوليا على التوست','Fish and chips':'سمك مع البطاطس','Jacket potato':'بطاطس مخبوزة','Sunday roast':'مشويات الأحد','Chicken tikka masala':'دجاج تيكا ماسالا','Shepherd’s pie':'فطيرة الراعي','Sticky toffee pudding':'بودينغ التوفي',
'Eggs and bacon':'بيض مع لحم مقدد','Bagel with cream cheese':'بيغل مع جبن كريمي','Pancakes and maple syrup':'بان كيك بشراب القيقب','Turkey sandwich':'ساندويتش ديك رومي','Mac and cheese':'مكرونة بالجبن','Cheeseburger':'تشيز برغر','BBQ chicken':'دجاج باربكيو','Chili':'تشيلي','Apple pie':'فطيرة التفاح',
'Poha':'بوها','Idli and sambar':'إدلي مع سامبار','Paratha':'براتا','Dal and rice':'دال مع الأرز','Chana masala':'تشانا ماسالا','Biryani':'برياني','Butter chicken':'دجاج بالزبدة','Palak paneer':'بالاك بانير','Masala dosa':'ماسالا دوسا','Gulab jamun':'غولاب جامون',
'Miso soup and rice':'شوربة ميسو مع الأرز','Onigiri':'أونيغيري','Soba noodles':'نودلز سوبا','Udon noodles':'نودلز أودون','Chicken katsu':'دجاج كاتسو','Yakitori':'ياكيتوري','Mochi':'موتشي',
'Chilaquiles':'تشيلاكيلس','Huevos rancheros':'بيض رانشيروس','Quesadilla':'كيساديا','Pozole':'بوزولي','Burrito':'بوريتو','Enchiladas':'إنشيلادا','Guacamole and tortilla chips':'غواكامولي مع رقائق التورتيلا'
};

export function localizeFoodName(name:string, language:AppLanguage):string {
  return language === 'ar' ? (ar[name] || name) : name;
}

export function localizeFoodSuggestions(items:FoodSuggestion[], language:AppLanguage, query=''):FoodSuggestion[] {
  const q=query.trim().toLocaleLowerCase(language==='ar'?'ar':'en');
  return items.map(item=>({...item,name:localizeFoodName(item.name,language)})).filter(item=>!q||item.name.toLocaleLowerCase(language==='ar'?'ar':'en').includes(q));
}

export function hasArabicFoodLabel(name:string):boolean { return /[\u0600-\u06FF]/.test(ar[name] || ''); }
