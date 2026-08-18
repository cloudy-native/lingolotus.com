/**
 * Post-session chrome for deck study / story finish.
 * Marks progress and offers pair CTA or Learn home.
 */

import { useEffect, useState } from "react";
import {
  markDeckComplete,
  markStoryComplete,
  type Level,
} from "@/lib/progress";
import {
  getBrowsePath,
  getHomePath,
  getStoryPath,
  getUnitPath,
  withUnitQuery,
} from "@/lib/utils";

export interface PairedStoryInfo {
  storyId: string;
  bookId: string;
  title: string;
}

interface DeckSessionCompleteProps {
  kind: "deck";
  deckId: string;
  deckName: string;
  level?: Level;
  stepIndex?: number;
  pairedStory?: PairedStoryInfo | null;
  storyAlreadyComplete?: boolean;
  correct?: number;
  incorrect?: number;
  total?: number;
  unitId?: string | null;
}

interface StorySessionCompleteProps {
  kind: "story";
  storyId: string;
  storyTitle: string;
  level?: Level;
  stepIndex?: number;
  nextHref?: string | null;
  nextLabel?: string | null;
  unitId?: string | null;
}

type Props = DeckSessionCompleteProps | StorySessionCompleteProps;

export default function SessionComplete(props: Props) {
  const [saved, setSaved] = useState(false);
  const [storyDone, setStoryDone] = useState(
    props.kind === "deck" ? Boolean(props.storyAlreadyComplete) : false,
  );

  useEffect(() => {
    if (props.kind === "deck") {
      const next = markDeckComplete(props.deckId, {
        level: props.level,
        stepIndex: props.stepIndex,
        unitId: props.unitId || undefined,
      });
      if (props.pairedStory) {
        setStoryDone(next.completedStories.includes(props.pairedStory.storyId));
      }
    } else {
      markStoryComplete(props.storyId, {
        level: props.level,
        stepIndex: props.stepIndex,
        unitId: props.unitId || undefined,
      });
    }
    setSaved(true);
    // Run once on mount for this completion screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (props.kind === "deck") {
    const showPair = props.pairedStory && !storyDone;
    const pairHref = props.pairedStory
      ? withUnitQuery(
          getStoryPath(props.pairedStory.bookId, props.pairedStory.storyId),
          props.unitId,
        )
      : null;

    const hasScores =
      typeof props.correct === "number" &&
      typeof props.incorrect === "number" &&
      typeof props.total === "number";

    return (
      <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-stone-200 bg-paper p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-orange-800">Deck complete</p>
        <h2 className="text-2xl font-bold text-stone-900">{props.deckName}</h2>
        {hasScores && (
          <div className="flex justify-center gap-4 text-sm">
            <span className="font-medium text-emerald-600">
              Correct: {props.correct}
            </span>
            <span className="font-medium text-amber-600">
              Incorrect: {props.incorrect}
            </span>
            <span className="text-stone-600">
              of {props.total}
            </span>
          </div>
        )}
        {saved && (
          <p className="text-sm text-stone-500">Saved on this device</p>
        )}
        <div className="flex flex-col gap-3 pt-2">
          {showPair && pairHref && props.pairedStory && (
            <a
              href={pairHref}
              className="inline-flex w-full items-center justify-center rounded-xl bg-orange-800 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-900"
            >
              Read: {props.pairedStory.title}
            </a>
          )}
          {props.unitId && (
            <a
              href={getUnitPath(props.unitId)}
              className={
                showPair
                  ? "inline-flex w-full items-center justify-center rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                  : "inline-flex w-full items-center justify-center rounded-xl bg-orange-800 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-900"
              }
            >
              Back to unit
            </a>
          )}
          <a
            href={getHomePath()}
            className="inline-flex w-full items-center justify-center rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            Back to Learn
          </a>
          <a
            href={getBrowsePath()}
            className="text-sm font-medium text-stone-500 hover:text-stone-800"
          >
            Browse library
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-stone-200 bg-paper p-6 text-center shadow-sm">
      <p className="text-sm font-medium text-orange-800">Story complete</p>
      <h2 className="text-2xl font-bold text-stone-900">{props.storyTitle}</h2>
      {saved && <p className="text-sm text-stone-500">Saved on this device</p>}
      <div className="flex flex-col gap-3 pt-2">
        {props.unitId && (
          <a
            href={getUnitPath(props.unitId)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-orange-800 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-900"
          >
            Back to unit
          </a>
        )}
        <a
          href={getHomePath()}
          className={
            props.unitId
              ? "inline-flex w-full items-center justify-center rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
              : "inline-flex w-full items-center justify-center rounded-xl bg-orange-800 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-900"
          }
        >
          Back to Learn
        </a>
        {props.nextHref && (
          <a
            href={props.nextHref}
            className="inline-flex w-full items-center justify-center rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            {props.nextLabel || "Next step"}
          </a>
        )}
      </div>
    </div>
  );
}
