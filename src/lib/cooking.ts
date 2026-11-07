// Memberships describe the recipe and explicit, measured variations, not passing
// substitutions or serving suggestions. A recipe can belong to more than one group.
export const recipeCategoryIds = ['soup', 'pasta', 'rice', 'casserole', 'curry', 'side', 'baking', 'breakfast', 'seasoning', 'chicken', 'beef', 'pork', 'turkey'] as const;
export type RecipeCategory = typeof recipeCategoryIds[number];
export const recipeCategoryLabels: Record<RecipeCategory, string> = {
  soup: 'Soups & stews', pasta: 'Pasta', rice: 'Rice', casserole: 'Casseroles',
  curry: 'Curries', side: 'Sides & salads', baking: 'Baking & sweets',
  breakfast: 'Breakfast', seasoning: 'Sauces & seasonings',
  chicken: 'Chicken', beef: 'Beef', pork: 'Pork', turkey: 'Turkey',
};
export const recipeCategoryDescriptions: Record<RecipeCategory, string> = {
  soup: 'Broth, beans, and a pot on the stove. Soups and stews for a bowl worth sitting down to.',
  pasta: 'Orzo, rigatoni, spaghetti. A little pasta water and a sauce to bring it together.',
  rice: 'From a simple pot of lime rice to a whole chicken cooked over saffron basmati.',
  casserole: 'Layers, bubbling edges, and dinner straight from the oven.',
  curry: 'Toasted spices, coconut, and rich sauces. Bring rice and a spoon.',
  side: 'Greens, potatoes, and the things that complete the table.',
  baking: 'Butter, flour, and a warm oven. Loaves and cookies for the kitchen counter.',
  breakfast: 'A slice of something baked, or yogurt with fruit. Start here.',
  seasoning: 'The dressings and spice blends that give the rest of dinner its flavor.',
  chicken: 'Roasted whole, folded into pasta, or simmered in a pot of soup.',
  beef: 'A hot grill, a slow braise, or a pie under a layer of potatoes.',
  pork: 'Slow braises, crisp edges, and pork that pulls apart with a fork.',
  turkey: 'A holiday roast, chile-spiced chili, and a turkey variation on cottage pie.',
};
