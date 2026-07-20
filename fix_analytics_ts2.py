import pathlib

# Fix ProviderDistribution
path = pathlib.Path('src/components/analytics/ProviderDistribution.tsx')
content = path.read_text(encoding='utf-8')
# Restore the second map
content = content.replace("{data.map((_, index) => (\n            <div key={entry.name}", "{data.map((entry, index) => (\n            <div key={entry.name}")
path.write_text(content, encoding='utf-8')

# Fix MetricCards
path2 = pathlib.Path('src/components/analytics/MetricCards.tsx')
content2 = path2.read_text(encoding='utf-8')
content2 = content2.replace("function Card({ card, index, refreshTrigger }: { card: any, index: number, refreshTrigger?: boolean }) {", "function Card({ card, index }: { card: any, index: number }) {")
content2 = content2.replace("<Card key={card.title} card={card} index={i} refreshTrigger={refreshTrigger} />", "<Card key={card.title} card={card} index={i} />")
path2.write_text(content2, encoding='utf-8')
print("Fixed secondary TS errors.")
