/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CSS} from '../../../build/amp-access-0.1.css';
import {LocalSubscriptionPlatform} from './local-subscription-platform';
import {SubscriptionPlatform} from './subscription-platform';
import {installStylesForDoc} from '../../../src/style-installer';

/** @const */
const TAG = 'amp-subscriptions';

export class SubscriptionService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private */
    this.ampdoc_ = ampdoc;

    // Install styles.
    installStylesForDoc(ampdoc, CSS, () => {}, false, TAG);

    /** @private @const {!Array<!SubscriptionPlatform>} */
    this.subscriptionPlatforms_ = [];
  }

  /**
   * @private
   * @return {Promise<Object>}
   */
  initialize_() {
    // TODO(@prateekbh): read this config from the document.
    const config = [
      {
        paywallUrl: '/subscription/1/entitlements',
      },
      {
        paywallUrl: '/subscription/2/entitlements',
      },
    ];

    return new Promise(resolve => {
      config.forEach(subscriptionPlatformConfig => {
        this.subscriptionPlatforms_.push(
            new LocalSubscriptionPlatform(
                this.ampdoc_,
                subscriptionPlatformConfig.paywallUrl
            )
        );
      });
      resolve();
    });
  }

  /**
   * @private
   */
  processEntitlement_() {
    // TODO(@prateekbh): process and unblock marup here.
  }

  /**
   * @private
   */
  start_() {
    this.initialize_().then(() => {
      this.subscriptionPlatforms_.forEach(subscriptionPlatform => {
        subscriptionPlatform.getEntitlements()
            .then(() => this.processEntitlement_());
      });
    });
  }

  /** @private */
  getPlatformClassForTesting_() {return SubscriptionPlatform;}

}

// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc('access', function(ampdoc) {
    return new SubscriptionService(ampdoc).start_();
  });
});