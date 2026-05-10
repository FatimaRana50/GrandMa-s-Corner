const router = require('express').Router();
const MenuItem = require('../models/MenuItem');

// AI food suggestion using Grok API
router.post('/suggest', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message required' });

    // Get available menu items for context
    const menuItems = await MenuItem.find({ available: true }).populate('vendor', 'name').limit(50);
    const menuContext = menuItems.map(i => `${i.name} (${i.category}, Rs ${i.price} ${i.unit}) from ${i.vendor?.name}`).join('\n');

    const apiKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
    
    if (!apiKey) {
      // Fallback smart suggestions without AI
      const lower = message.toLowerCase();
      let suggestions = [];
      if (lower.includes('hungry') || lower.includes('snack')) {
        suggestions = menuItems.filter(i => i.category === 'frozen').slice(0, 3);
      } else if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('cake') || lower.includes('brownie')) {
        suggestions = menuItems.filter(i => ['fudgy', 'walnut', 'cake', 'date'].some(k => i.name.toLowerCase().includes(k))).slice(0, 3);
      } else if (lower.includes('kid') || lower.includes('child') || lower.includes('lunch')) {
        suggestions = menuItems.filter(i => i.category === 'kids').slice(0, 3);
      } else if (lower.includes('tea') || lower.includes('party') || lower.includes('sandwich')) {
        suggestions = menuItems.filter(i => i.category === 'tea').slice(0, 3);
      } else {
        suggestions = menuItems.slice(0, 3);
      }
      return res.json({
        reply: `Based on what you're looking for, here are my top picks from our menu! ${suggestions.map(s => `🍽️ **${s.name}** - Rs ${s.price} ${s.unit}`).join(', ')}. Remember orders need 3 days lead time!`,
        suggestions: suggestions.map(s => ({ _id: s._id, name: s.name, price: s.price, unit: s.unit, vendor: s.vendor }))
      });
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'grok-3-mini',
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `You are a friendly food assistant for Grandma's Corner, a home-based food ordering platform in Rawalpindi, Pakistan. 
Help customers choose what to order based on their mood/cravings.
Always recommend specific items from the menu below and keep responses warm and short (2-3 sentences max).
IMPORTANT: End your response with a JSON block like this: [ITEMS:item1name,item2name,item3name]

Available menu:
${menuContext}`
          },
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
  const errorText = await response.text();
  console.error(" GROK RAW ERROR:", errorText);
  throw new Error(`Grok API error: ${errorText}`);
}
    const data = await response.json();
    const rawReply = data.choices?.[0]?.message?.content || "I'd love to help you pick something delicious!";
    
    // Parse item names from response
    const itemMatch = rawReply.match(/\[ITEMS:([^\]]+)\]/);
    let suggestions = [];
    if (itemMatch) {
      const names = itemMatch[1].split(',').map(n => n.trim());
      suggestions = menuItems.filter(i => names.some(n => i.name.toLowerCase().includes(n.toLowerCase()))).slice(0, 3);
    }
    const cleanReply = rawReply.replace(/\[ITEMS:[^\]]+\]/, '').trim();

    res.json({ reply: cleanReply, suggestions: suggestions.map(s => ({ _id: s._id, name: s.name, price: s.price, unit: s.unit, vendor: s.vendor })) });
  } catch (err) {
    console.error('AI suggest error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
