import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TraitMeter } from "./TraitMeter";
import { StructureAbstractCard } from "./StructureAbstractCard";
import { POST_TYPE_LABELS, TRAIT_LABELS } from "@/lib/openai/labels";
import type { Analysis } from "@/lib/openai/schemas";

export function AnalysisPanel({ analysis }: { analysis: Analysis }) {
  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">バズ要因（一言）</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base font-medium text-foreground">{analysis.buzzFactorSummary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">冒頭のフック</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{analysis.openingHook}</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">投稿構造</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground">{analysis.structure}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">スコア指標</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TraitMeter label={TRAIT_LABELS.empathy} {...analysis.empathy} />
          <TraitMeter label={TRAIT_LABELS.surprise} {...analysis.surprise} />
          <TraitMeter label={TRAIT_LABELS.controversy} {...analysis.controversy} />
          <TraitMeter label={TRAIT_LABELS.saveValue} {...analysis.saveValue} />
          <TraitMeter label={TRAIT_LABELS.selfRelevance} {...analysis.selfRelevance} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">感情・投稿タイプ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {analysis.emotion.map((e) => (
                <Badge key={e} variant="secondary">
                  {e}
                </Badge>
              ))}
            </div>
            <Badge variant="outline">{POST_TYPE_LABELS[analysis.postType] ?? analysis.postType}</Badge>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">読者ターゲット / CTA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-foreground">{analysis.targetReader}</p>
            <p className="text-xs text-muted-foreground">
              {analysis.cta.present ? `CTAあり: ${analysis.cta.text ?? ""}` : "CTAなし"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">なぜ伸びた可能性があるのか</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{analysis.whyItWentViral}</p>
        </CardContent>
      </Card>

      <StructureAbstractCard structureAbstract={analysis.structureAbstract} />
    </div>
  );
}
