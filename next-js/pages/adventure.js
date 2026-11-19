/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import Head from 'next/head';
import aemHeadlessClient from '../lib/aem-headless-client';

function AdventureView({ adventure }) {
  const {
    title,
    activity,
    adventureType,
    price,
    tripLength,
    groupSize,
    difficulty,
    primaryImage,
    description,
    itinerary,
  } = adventure;
  return (
    <Layout adventure>

      <Head>
        <title>{title}</title>
      </Head>

      <article>
        <div className="bg-white">
          <div className="pt-6">

            <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden lg:h-80 lg:aspect-none">
              <img
                alt={title}
                src={aemHeadlessClient.serveFromAem(primaryImage?._path || primaryImage?._dynamicUrl)}
                className="w-full h-full object-center object-cover lg:w-full lg:h-full"
              />
            </div>

            {/* Product info */}
            <div className="max-w-2xl mx-auto pt-10 pb-16 px-4 sm:px-6 lg:max-w-7xl lg:pt-16 lg:pb-24 lg:px-8 lg:grid lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8">
              <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
              </div>

              {/* Options */}
              <div className="mt-4 lg:mt-0 lg:row-span-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl text-gray-900 mb-10">${price} USD</p>
                <dl>
                  <div className="py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Activity</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{activity}</dd>
                  </div>
                  <div className="py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{adventureType}</dd>
                  </div>
                  <div className="py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Trip Length</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{tripLength}</dd>
                  </div>
                  <div className="py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Group Size</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{groupSize}</dd>
                  </div>
                  <div className="py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">Difficulty</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{difficulty}</dd>
                  </div>
                </dl>

              </div>

              <div className="py-10 lg:pt-6 lg:pb-16 lg:col-start-1 lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
                {/* Description and Itinerary */}
                <div>
                  <h3 className="sr-only">Description</h3>
                  <div className="space-y-6">
                    <div className="text-base text-gray-900" dangerouslySetInnerHTML={{
                      __html: description.html,
                    }}></div>
                  </div>
                </div>

                <div className="mt-10">
                  <h2 className="text-base font-bold text-gray-900">Itinerary</h2>

                  <div className="mt-4 space-y-6">
                    <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{
                      __html: itinerary.html,
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </article>
    </Layout>
  );
}

export default function Adventure() {
  const { isReady, query } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;
  const [adventure, setAdventure] = useState(null);
  const [error, setError] = useState(null);

  // Fetched in the browser so content changes (and new adventures) show up without a rebuild
  useEffect(() => {
    if (!isReady) return;
    if (!slug) { setError('No adventure selected.'); return; }
    aemHeadlessClient
      .getAdventuresBySlug(slug, { imageWidth: 1600, imageQuality: 95 })
      .then((res) => {
        const item = res?.data?.adventureList?.items?.[0];
        item ? setAdventure(item) : setError(`Cannot find adventure "${slug}".`);
      })
      .catch((e) => setError(e.message));
  }, [isReady, slug]);

  if (adventure) return <AdventureView adventure={adventure} />;
  return (
    <Layout adventure>
      <Head><title>Adventure</title></Head>
      <p className="max-w-2xl mx-auto py-16 px-4 text-gray-500">{error || 'Loading adventure…'}</p>
    </Layout>
  );
}
